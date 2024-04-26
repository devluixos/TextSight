import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { DocumentAnalysis, Entity, Keyword, Topic } from 'model';
import { fetchAllDocumentData } from 'sqlite/sqlHandler';
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
      model: "gpt-4-turbo-preview", // Testing this model
      messages: [{role: 'user', content: promptBuilder(promptText)}],
      temperature: 0.7,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error(error);
  }
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
      and the median weight of each connection based on the weights for connections identified.\n`;

  documentsAnalysis.forEach((doc, index) => {
    prompt += `Document ${index + 1} (${doc.id}):\n`;
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
          medianWeight: 7.5
        }],
        entities: [{
          connectedDocumentIds: ["exampleDocumentId2"],
          sharedAttributes: ["exampleEntity"],
          medianWeight: 7.5
        }],
        topics: [{
          connectedDocumentIds: ["exampleDocumentId2"],
          sharedAttributes: ["exampleTopic"],
          medianWeight: 7.5
        }]
      }
    }]
  }, null, 2);

  prompt += `\nInclude the document IDs for each connection, specifying connection type and shared attributes. 
              Output should be purely in JSON. Just plain JSON, no markdown added.`;

  console.log(prompt);
  return prompt;
}


export async function callGPT4forConnections() {
  try {
    console.log('111 Calling gipiti for connections...');
    const prompt = await constructComprehensivePromptForAllDocuments();
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Testing this model
      messages: [{role: 'user', content: prompt}],
      temperature: 0.7,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error(error);
  }
}


export const isConnectionAnalysisLoading = writable(false);
export const connectionAnalysisErrorMessage = writable('');
/**
 * Handle the analysis of connections
 */
export async function handleAnalyseConnections() {
  isConnectionAnalysisLoading.set(true);
  connectionAnalysisErrorMessage.set('');
  try {
    const results = await callGPT4forConnections();
    const parsedResults = typeof results === 'string' ? JSON.parse(results) : null;
    await saveConnectionAnalysisResults(parsedResults);
    console.log("Analysis processed and saved successfully.");
  } catch (error) {
    console.error("Error during text connection analysis:", error);
    connectionAnalysisErrorMessage.set("Failed to process and save analysis: " + error.message);
  } finally {
    isConnectionAnalysisLoading.set(false);
  }
}