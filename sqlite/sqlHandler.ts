import Dexie from 'dexie';

class TextAnalysisDB extends (Dexie as any) {
    constructor() {
        super('TextAnalysisDB');
        this.version(1).stores({
            documents: '++id, documentId, lastAnalyzed',
            entities: '++id, documentId, text, type, weight, [documentId+text]',
            topics: '++id, documentId, name, weight, [documentId+name]',
            keywords: '++id, documentId, keyword, importance, weight, [documentId+keyword]',
            relations: '++id, documentId, entity1, relation, entity2, weight',
            coreferences: '++id, documentId, text, reference, weight',
            sentiments: '++id, documentId, overallSentiment, score, weight'
        });
    }
}

export const db = new TextAnalysisDB();

export async function initializeDatabase() {
    console.log('Database initialized'); 
    //clearDatabase().catch(e => console.error(e));
}

export async function logDatabaseContent() {
    const allDocuments = await db.documents.toArray();
    console.log("Documents table content:", allDocuments);
  
    const allEntities = await db.entities.toArray();
    console.log("Entities table content:", allEntities);
  
    const allTopics = await db.topics.toArray();
    console.log("Topics table content:", allTopics);
  
    const allKeywords = await db.keywords.toArray();
    console.log("Keywords table content:", allKeywords);
  
    const allRelations = await db.relations.toArray();
    console.log("Relations table content:", allRelations);
  
    const allCoreferences = await db.coreferences.toArray();
    console.log("Coreferences table content:", allCoreferences);
  
    const allSentiments = await db.sentiments.toArray();
    console.log("Sentiments table content:", allSentiments);
  }


export async function saveAnalysisResults(leafId: any, apiResponse: any) {
    let analysisResponse;
    try {
        console.log('API response in sqlhandler:', apiResponse);
        analysisResponse = JSON.parse(apiResponse); // Assuming apiResponse.content is a JSON string
    } catch (error) {
      console.error("Failed to parse API response:", error);
      return;
    }
  
    // Save Document ID and Last Analyzed timestamp
    await db.documents.add({ documentId: leafId, lastAnalyzed: new Date() });

    // Save Named Entities
    if (analysisResponse.namedEntityRecognition?.entities) {
      for (const entity of analysisResponse.namedEntityRecognition.entities) {
        await db.entities.add({ ...entity, documentId: leafId });
      }
    }

    // Save Topic Modeling
    if (analysisResponse.topicModeling?.topics) {
        for (const topic of analysisResponse.topicModeling.topics) {
            await db.topics.add({ ...topic, documentId: leafId });
        }
    }

    // Save Keyword Extraction
    if (analysisResponse.keywordExtraction?.keywords) {
        for (const keyword of analysisResponse.keywordExtraction.keywords) {
            await db.keywords.add({ ...keyword, documentId: leafId });
        }
    }

    // Save Relation Extraction
    if (analysisResponse.relationExtraction?.relations) {
        for (const relation of analysisResponse.relationExtraction.relations) {
            await db.relations.add({ ...relation, documentId: leafId });
        }
    }

    // Save Coreference Resolution
    if (analysisResponse.coreferenceResolution?.coreferences) {
        for (const coreference of analysisResponse.coreferenceResolution.coreferences) {
            await db.coreferences.add({ ...coreference, documentId: leafId });
        }
    }

    // Sentiment Analysis can be a single record related to the document; assuming only one sentiment analysis result per document
    if (analysisResponse.sentimentAnalysis) {
        const { overallSentiment, score, weight } = analysisResponse.sentimentAnalysis;
        // Assuming a sentiment table or you can choose to add these fields to the documents table
        await db.sentiments.add({ documentId: leafId, overallSentiment, score, weight });
    }
  
    // Add similar checks and loops for topics, keywords, etc.
    console.log('Analysis results saved for leaf ID:', leafId);
  }

  export async function checkIfLeafExistsInDatabase(leafId: string): Promise<boolean> {
    const leaf = await db.documents.where('documentId').equals(leafId).first();
    // If the leaf exists in the database, return true
    if (leaf !== undefined) {
      return true;
    }
    // If the leaf does not exist in the database, return false
    return false;
  }

  export async function clearDatabase() {
    await db.transaction('rw', db.documents, db.entities, db.topics, db.keywords, db.relations, db.coreferences, db.sentiments, async () => {
      await db.documents.clear();
      await db.entities.clear();
      await db.topics.clear();
      await db.keywords.clear();
      await db.relations.clear();
      await db.coreferences.clear();
      await db.sentiments.clear();
    });
    console.log('Database cleared');
  }
  
