import OpenAI from 'openai';
import * as dotenv from 'dotenv';

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

function promptBuilder(prompt: string) {
  let finalPrompt = `
    Analyze the text to extract key insights in JSON format: 
    1. Perform Named Entity Recognition (NER) to identify and categorize entities such as people, 
      places, and organizations, including a 'weight' to denote importance. 
    2. Conduct Topic Modeling to pinpoint overarching themes, assigning a 'weight' for relevance. 
    3. Extract keywords highlighting crucial concepts, again with 'weight' for significance. 
    4. Identify relationships between entities (Relation Extraction) and resolve references to the same entity
      (Coreference Resolution), each with respective 'weights'. Structure results as per defined JSON.
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
      "sentimentAnalysis": {
        "overallSentiment": "",
        "score": 0,
        "weight": 0
      },
      "keywordExtraction": {
        "keywords": [
          {"keyword": "", "importance": 0, "weight": 0}
        ]
      },
      "relationExtraction": {
        "relations": [
          {"entity1": "", "relation": "", "entity2": "", "weight": 0}
        ]
      },
      "coreferenceResolution": {
        "coreferences": [
          {"text": "", "reference": "", "weight": 0}
        ]
      }
    }
    

    <<TEXT START>>
      ${prompt}
    <<TEXT END>>

    Analyze the provided text and return the results exclusively in JSON format, without any explanatory text. Just plain JSON, no markdown added.
  `;

  return finalPrompt;
}