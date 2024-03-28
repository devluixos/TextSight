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