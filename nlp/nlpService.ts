import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { DocumentAnalysis, DocumentDetail, Entity, Keyword, Topic } from 'model';
import { dropConnections, fetchAllDocumentData, fetchDetailedDocumentData } from 'sqlite/sqlHandler';
import { saveConnectionAnalysisResults } from 'sqlite/sqlHandler';
import { writable } from 'svelte/store';

/**
 * GPT API SETUP
 */
const basePath = (app.vault.adapter as any).basePath
//Load environment variables
dotenv.config({
  path: `${basePath}/.obsidian/plugins/TextSight/.env`,
  debug: false
 })

// Check if OPENAI_API_KEY is defined
if (!process.env.OPENAI_API_KEY) {
  console.log('The OPENAI_API_KEY environment variable is not defined');  
  throw new Error('The OPENAI_API_KEY environment variable is not defined');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});


/**
 * This uses the prompt to analyse a text using the GPT-4 model
 * @param promptText The text of the prompt to be sent to the GPT-4 model
 * @returns JSON string with the analysis of the text
 */
export async function callGPT4(promptText: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Testing this model
      messages: [{role: 'user', content: promptBuilder(promptText)}],
      temperature: 0.7,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error(error);
  }
}

// Function to clean JSON response
function cleanJsonResponse(response: string): string {
  // Remove markdown code blocks (```json ... ```)
  const cleanedResponse = response.replace(/```json([\s\S]*?)```/g, '$1');
  return cleanedResponse.trim();
}

/**
 * This function builds the prompt text to be sent to the GPT-4 model
 * @param prompt The text of the obsidian leaf to be analysed
 * @returns the prompt to be sent to the GPT-4 model
 */
function promptBuilder(prompt: string) {
  let finalPrompt = `
    Analyze the text to extract key insights in JSON format: 
    1. Perform Named Entity Recognition (NER) to identify and categorize entities such as people, 
      places, and organizations, including a 'weight' to denote importance. 
    2. Conduct Topic Modeling to pinpoint overarching themes, assigning a 'weight' for relevance. 
      The topics should be broad and easily comparable. 
    3. Extract keywords highlighting crucial concepts, again with 'weight' for significance. 
    4. The overall sentiment of the text
    The weight is always between 0 and 1.
    Structure results as per defined JSON.
    Structure the JSON output as follows:
    {
      "namedEntityRecognition": {
        "entities": [
          {"text": "", "type": "", "weight": 0}
        ]
      },
      "topicModeling": {
        "topics": [
          {"name": "", "weight": 0}
        ]
      },
      "keywordExtraction": {
        "keywords": [
          {"keyword": "", "weight": 0}
        ]
      },
      "sentimentAnalysis": {
        "overallSentiment": "",
        "weight": 0
      },
    }
    

    <<TEXT START>>
      ${prompt}
    <<TEXT END>>

    Analyze the provided text and return the results exclusively in JSON format, without any explanatory text. Just plain JSON, no markdown added.
  `;

  return finalPrompt;
}


/**
 * 
 * @returns a prompt for GPT with all the documents and their data
 */
export async function constructComprehensivePromptForAllDocuments(): Promise<string> {
  const documentsAnalysis: DocumentAnalysis[] = await fetchAllDocumentData();  // Await the promise
  let prompt = `Analyze thematic connections based on keywords, entities, and topics between the following documents, 
      noting even slight variations in terms. Consider the weights of each attribute to assess the strength of each connection.
      Provide the analysis in JSON format, listing each document's connections including document IDs and shared attributes 
      and the median weight of each connection based on the weights for connections identified.
      The weight is always between 0 and 1.
      Ensure that connections are bidirectional, i.e., if Document A is connected to Document B, Document B should also be connected to Document A.
      Make sure every connected document has the reverse connection in them aswell, its always bidirectional!\n`;

  documentsAnalysis.forEach((doc, index) => {
    prompt += `(${doc.id}):\n`;
    prompt += "Keywords: " + doc.keywords.map(k => `${k.keyword} (weight: ${k.weight})`).join(", ") + "\n";
    prompt += "Entities: " + doc.entities.map(e => `${e.text} (${e.type}, weight: ${e.weight})`).join(", ") + "\n";
    prompt += "Topics: " + doc.topics.map(t => `${t.name} (weight: ${t.weight})`).join(", ") + "\n\n";
  });

  // Example JSON structure for GPT-4 to fill
  prompt += "Please return the analysis in the following JSON structure, calculating median weights for each connection type:\n";
  prompt += JSON.stringify({
    analysis: [{
      documentId: "exampleDocumentId1",
      connections: {
        keywords: [{
          connectedDocumentIds: ["exampleDocumentId2"],
          sharedAttributes: ["exampleKeyword"],
          medianWeight: 0.5
        }],
        entities: [{
          connectedDocumentIds: ["exampleDocumentId2"],
          sharedAttributes: ["exampleEntity"],
          medianWeight: 0.5
        }],
        topics: [{
          connectedDocumentIds: ["exampleDocumentId2"],
          sharedAttributes: ["exampleTopic"],
          medianWeight: 0.5
        }]
      }
    }]
  }, null, 2);

  prompt += `\nInclude the document IDs for each connection, specifying connection type and shared attributes. 
              Output should be purely in JSON. Just plain JSON, no markdown added.`;

  console.log(prompt);
  return prompt;
}


// Function to call GPT-4 for connections
export async function callGPT4forConnections() {
  try {
      console.log('Calling GPT-4 for connections...');
      const prompt = await constructComprehensivePromptForAllDocuments();
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      // Clean the response to remove markdown formatting
      const rawResults = response.choices[0].message.content;
      const cleanedResults = rawResults ? cleanJsonResponse(rawResults) : '';
      console.log(cleanedResults);
      const results = JSON.parse(cleanedResults);
      
      return results;
  } catch (error) {
      console.error(error);
  }
}


export const isConnectionAnalysisLoading = writable(false);
export const connectionAnalysisErrorMessage = writable('');

export async function handleAnalyseConnections() {
  isConnectionAnalysisLoading.set(true);
  connectionAnalysisErrorMessage.set('');
  try {
    // Drop existing connections to start with a clean slate
    await dropConnections();

    const results = await callGPT4forConnections();
    const bidirectionalResults = ensureBidirectionalConnections(results);

    // Save the bidirectional results
    await saveConnectionAnalysisResults(bidirectionalResults);
    console.log("Analysis processed and saved successfully.");

    // Fetch detailed data to verify connections
    const detailedDocuments = await fetchDetailedDocumentData();

    // Verify the bidirectional connections
    const connectionsValid = verifyConnections(detailedDocuments);
    if (connectionsValid) {
      console.log("All connections are bidirectional and valid.");
    } else {
      console.error("Some connections are missing their reverse counterparts.");
    }

  } catch (error) {
    console.error("Error during text connection analysis:", error);
    connectionAnalysisErrorMessage.set("Failed to process and save analysis: " + error.message);
  } finally {
    isConnectionAnalysisLoading.set(false);
  }
}



function ensureBidirectionalConnections(results: any) {
  if (!results || !results.analysis) {
      console.error("Invalid results format:", results);
      return { analysis: [] };
  }

  const connectionsMap = new Map<string, any>();

  results.analysis.forEach((doc: any) => {
      const { documentId, connections } = doc;
      if (!connectionsMap.has(documentId)) {
          connectionsMap.set(documentId, {
              documentId,
              connections: {
                  keywords: [],
                  entities: [],
                  topics: []
              }
          });
      }

      ['keywords', 'entities', 'topics'].forEach(connectionType => {
          if (connections[connectionType]) {
              connections[connectionType].forEach((connection: any) => {
                  connection.connectedDocumentIds.forEach((connectedDocumentId: string) => {
                      const forwardConnection = {
                          connectedDocumentId,
                          sharedAttributes: connection.sharedAttributes,
                          medianWeight: connection.medianWeight
                      };

                      // Add forward connection
                      connectionsMap.get(documentId).connections[connectionType].push(forwardConnection);

                      // Ensure the reverse connection
                      if (!connectionsMap.has(connectedDocumentId)) {
                          connectionsMap.set(connectedDocumentId, {
                              documentId: connectedDocumentId,
                              connections: {
                                  keywords: [],
                                  entities: [],
                                  topics: []
                              }
                          });
                      }

                      // Check if the reverse connection already exists
                      const existingReverseConnection = connectionsMap.get(connectedDocumentId).connections[connectionType]
                          .find((conn: any) => conn.connectedDocumentId === documentId);

                      if (!existingReverseConnection) {
                          const reverseConnection = {
                              connectedDocumentId: documentId,
                              sharedAttributes: connection.sharedAttributes,
                              medianWeight: connection.medianWeight
                          };
                          connectionsMap.get(connectedDocumentId).connections[connectionType].push(reverseConnection);
                      } else {
                          // Merge sharedAttributes and update weight if necessary
                          existingReverseConnection.sharedAttributes = Array.from(new Set([...existingReverseConnection.sharedAttributes, ...connection.sharedAttributes]));
                          existingReverseConnection.medianWeight = (existingReverseConnection.medianWeight + connection.medianWeight) / 2;
                      }
                  });
              });
          }
      });
  });

  return { analysis: Array.from(connectionsMap.values()) };
}




function verifyConnections(documents: DocumentDetail[]): boolean {
  let valid = true;
  documents.forEach(doc => {
    doc.connections.forEach(conn => {
      const targetDoc = documents.find(d => d.documentId === conn.connectedDocumentId);
      if (targetDoc) {
        const reverseConnection = targetDoc.connections.find(c => c.connectedDocumentId === doc.documentId);
        if (!reverseConnection) {
          console.error(`Missing reverse connection from ${conn.connectedDocumentId} to ${doc.documentId}`);
          valid = false;
        }
      }
    });
  });
  return valid;
}

