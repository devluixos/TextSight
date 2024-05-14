/**
 * Database interfaces
 */
export interface Document {
    id: number;
    documentId: string;
    lastAnalyzed: Date;
}
  
export interface Entity {
    id: number;
    documentId: string;
    text: string;
    type: string;
    weight: number;
}
  
export interface Topic {
    id: number;
    documentId: string;
    name: string;
    weight: number;
}
  
export interface Keyword {
    id: number;
    documentId: string;
    keyword: string;
    importance: number;
    weight: number;
}
  
export interface DocumentAnalysis {
    id: string;
    keywords: Keyword[];
    entities: Entity[];
    topics: Topic[];
}

export interface IDocumentConnection {
    id?: number;
    documentId: string;
    connectedDocumentId: string;
    connectionType: string;
    sharedAttributes: string[];
}

export class NodeModel {
    id: string;
    documentData: any; // Includes topics, entities, keywords, sentiments
    connections: any[];

    constructor(id: string, documentData: any, connections: any[]) {
        this.id = id;
        this.documentData = documentData;
        this.connections = connections;
    }
}

/**
 * Connection Analysis Interfaces
 */

export interface ConnectionDetail {
    documentId1: string;       
    documentId2: string;       
    connectionType: 'topic' | 'keyword' | 'entity';
    sharedAttributes: string[];  // Shared topics, keywords, or entities
  }
  
export interface DocumentConnection {
    documentId: string;       
    connections: ConnectionDetail[];
  }
  
  export interface ConnectionAnalysisResult {
    analysis: DocumentConnection[];
  }
  

/**
 * Visualisation Logic Interface
 */
export interface TopicConnection {
    documentId: string;
    connectedDocumentId: string;
    sharedAttributes: string[];
    weight?: number;
  }

export interface TopicGroup {
    [key: string]: TopicConnection[];
}

export interface DocumentDetail {
    documentId: string;
    lastAnalyzed: Date;
    entities: any[];
    topics: any[];
    keywords: any[];
    sentiments: any[];
    connections: { connectedDocumentId: string }[];
    position?: { x: number, y: number, z: number };
    force?: { x: number, y: number, z: number };
}