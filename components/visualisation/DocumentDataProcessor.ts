// Import your database configuration and required libraries
import { db } from '../../sqlite/sqlHandler';

// This is a TypeScript interface for typing our document data structure.
export interface DocumentDetail {
    documentId: string;
    lastAnalyzed: Date;
    entities: any[];
    topics: any[];
    keywords: any[];
    sentiments: any[];
    connections: any[];
}

// Function to fetch detailed document data from the database
export async function fetchDetailedDocumentData(): Promise<DocumentDetail[]> {
    const documents = await db.documents.toArray();
    const detailedDocuments = [];

    for (const document of documents) {
        const entities = await db.entities.where({ documentId: document.documentId }).toArray();
        const topics = await db.topics.where({ documentId: document.documentId }).toArray();
        const keywords = await db.keywords.where({ documentId: document.documentId }).toArray();
        const sentiments = await db.sentiments.where({ documentId: document.documentId }).toArray();
        const connections = await db.documentConnections.where({ documentId: document.documentId }).toArray();

        // Fetch the detailed information of connected documents
        const detailedConnections = await Promise.all(connections.map(async (conn: { connectedDocumentId: any; }) => {
            const connectedDocument = await db.documents.get(conn.connectedDocumentId);
            return {
                ...conn,
                connectedDocument: connectedDocument ? {
                    documentId: connectedDocument.documentId,
                    lastAnalyzed: connectedDocument.lastAnalyzed
                } : null  // Ensure we handle cases where the connected document might not exist.
            };
        }));

        // Aggregate all related data into a single object for each document
        detailedDocuments.push({
            documentId: document.documentId,
            lastAnalyzed: document.lastAnalyzed,
            entities,
            topics,
            keywords,
            sentiments,
            connections: detailedConnections
        });
    }
    return detailedDocuments;
}

// Optionally, you can create additional functions to filter or restructure this data based on various criteria
export function filterDocumentsByTopic(documents: DocumentDetail[], topicName: string): DocumentDetail[] {
    return documents.filter(doc => doc.topics.some(topic => topic.name === topicName));
}
