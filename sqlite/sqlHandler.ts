import Dexie from 'dexie';

class TextAnalysisDB extends (Dexie as any) {
    constructor() {
        super('TextAnalysisDB');
        this.version(1).stores({
            documents: '++id, filePath, lastAnalyzed',
            entities: '++id, documentId, text, type, weight, [documentId+text]',
            topics: '++id, documentId, name, weight, [documentId+name]',
            keywords: '++id, documentId, keyword, importance, weight, [documentId+keyword]',
            relations: '++id, documentId, entity1, relation, entity2, weight',
            coreferences: '++id, documentId, text, reference, weight'
        });
    }
}

export const db = new TextAnalysisDB();

export async function initializeDatabase() {
    console.log('Database initialized');
    const allDocuments = await db.documents.toArray();
    console.log("Documents table content:", allDocuments);
}

export async function logDatabaseContent() {
    const allDocuments = await db.documents.toArray();
    console.log("Documents table content:", allDocuments);
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
  
    if (analysisResponse.namedEntityRecognition?.entities) {
      for (const entity of analysisResponse.namedEntityRecognition.entities) {
        console.log('Entity:', entity);
        await db.entities.add({ ...entity, documentId: leafId });
      }
    } else {
      console.error("No entities found in the analysis response.");
    }
  
    // Add similar checks and loops for topics, keywords, etc.
    console.log('Analysis results saved for leaf ID:', leafId);
  }
  

