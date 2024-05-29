import Dexie from 'dexie';
import { Document, Entity, Topic, Keyword, DocumentAnalysis, NodeModel, DocumentDetail } from '../model';


class TextAnalysisDB extends (Dexie as any) {
    constructor() {
        super('TextAnalysisDB');
        this.version(1).stores({
            documents: '++id, documentId, lastAnalyzed',
            entities: '++id, documentId, text, type, weight, [documentId+text]',
            topics: '++id, documentId, name, weight, [documentId+name]',
            keywords: '++id, documentId, keyword, weight, [documentId+keyword]',
            sentiments: '++id, documentId, overallSentiment, weight',
            documentConnections: '++id, documentId, connectedDocumentId, connectionType, sharedAttributes, weight',
        });
    }
}

export const db = new TextAnalysisDB();

export async function initializeDatabase() {
    console.log('Database initialized'); 
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
  
    const allSentiments = await db.sentiments.toArray();
    console.log("Sentiments table content:", allSentiments);

    const allConnections = await db.documentConnections.toArray();
    console.log("Connections table content:", allConnections);

    console.log(fetchDetailedDocumentData());

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

    // Sentiment Analysis can be a single record related to the document; assuming only one sentiment analysis result per document
    if (analysisResponse.sentimentAnalysis) {
        const { overallSentiment, weight } = analysisResponse.sentimentAnalysis;
        // Assuming a sentiment table or you can choose to add these fields to the documents table
        await db.sentiments.add({ documentId: leafId, overallSentiment, weight });
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

  export async function saveConnectionAnalysisResults(analysisResults: any) {
    try {
        console.log('Analysis results in sqlHandler:', analysisResults);
        for (const docResult of analysisResults.analysis) {
            const documentId = docResult.documentId;
            const connections = docResult.connections;

            for (const connectionType in connections) {
                const connectionList = connections[connectionType];
                for (const connection of connectionList) {
                    await db.documentConnections.add({
                        documentId,
                        connectedDocumentId: connection.connectedDocumentId,
                        connectionType,
                        sharedAttributes: connection.sharedAttributes,
                        weight: connection.medianWeight
                    });
                }
            }
        }
        console.log("Connections successfully saved to the database.");
    } catch (error) {
        console.error("Failed to save connection analysis results:", error);
        throw new Error("Error saving connection results to the database: " + error.message);
    }
}




  export async function fetchAllDocumentData(): Promise<DocumentAnalysis[]> {
    const documents: Document[] = await db.documents.toArray();
    const entities: Entity[] = await db.entities.toArray();
    const topics: Topic[] = await db.topics.toArray();
    const keywords: Keyword[] = await db.keywords.toArray();

    // Organize data by document
    const documentAnalysis: DocumentAnalysis[] = documents.map(doc => ({
        id: doc.documentId,
        keywords: keywords.filter((k: Keyword) => k.documentId === doc.documentId),
        entities: entities.filter((e: Entity) => e.documentId === doc.documentId),
        topics: topics.filter((t: Topic) => t.documentId === doc.documentId)
    }));

    console.log('Document analysis fetched:', documentAnalysis);
    return documentAnalysis;
}

export async function fetchDetailedDocumentData(): Promise<DocumentDetail[]> {
  const documents = await db.documents.toArray();
  const detailedDocuments: DocumentDetail[] = [];

  for (const document of documents) {
      const entities = await db.entities.where({ documentId: document.documentId }).toArray();
      const topics = await db.topics.where({ documentId: document.documentId }).toArray();
      const keywords = await db.keywords.where({ documentId: document.documentId }).toArray();
      const sentiments = await db.sentiments.where({ documentId: document.documentId }).toArray();
      const connections = await db.documentConnections.where({ documentId: document.documentId }).toArray();

      // Aggregate all related data into a single object for this document
      detailedDocuments.push({
          ...document,
          entities,
          topics,
          keywords,
          sentiments,
          connections: connections.map((conn: { connectedDocumentId: any; }) => ({
              ...conn,
              connectedDocument: documents.find((d: { documentId: any; }) => d.documentId === conn.connectedDocumentId) || null
          }))
      });
  }
  console.log('Detailed document data fetched:', detailedDocuments);
  return detailedDocuments;
}

export async function dropConnections() {
  await db.transaction('rw', db.documentConnections, async () => {
    await db.documentConnections.clear();
  });
}


  export async function clearDatabase() {
    await db.transaction('rw', db.documents, db.entities, db.topics, db.keywords, db.sentiments, db.documentConnections, async () => {
      await db.documents.clear();
      await db.entities.clear();
      await db.topics.clear();
      await db.keywords.clear();
      await db.sentiments.clear();
      await db.documentConnections.clear();
    });
    console.log('Database cleared');
  }
  
