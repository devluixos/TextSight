import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../' });

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});


export async function callGPT4(promptText: string) {
  try {
    console.log(process.env.OPENAI_API_KEY);
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
    Analyze the provided text to extract the following information, structuring the results exclusively in JSON format:
    Named Entity Recognition (NER): Identify and categorize entities (people, places, organizations, etc.), with a list of entities and their types.
    Topic Modeling: Identify the overarching topics or themes.
    Semantic Similarity: Compare the text to a predefined set of topics or documents to find semantic similarities, listing the most similar topics or documents.

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
    "semanticSimilarity": {
      "similarities": [
        {"documentName": "", "similarityScore": 0}
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