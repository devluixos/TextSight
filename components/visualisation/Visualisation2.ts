import { writable } from 'svelte/store';
import { db } from '../../sqlite/sqlHandler';

export const visualizationData = writable<any[]>([]);

export async function fetchData() {
    try {
        const documents = await db.documents.toArray();
        const connections = await db.documentConnections.toArray();

        const nodes = documents.map((doc: { documentId: any; }, index: any) => ({
            id: doc.documentId,
            connections: connections.filter((conn: { documentId: any; }) => conn.documentId === doc.documentId).map((conn: { connectedDocumentId: any; }) => conn.connectedDocumentId),
        }));

        const positionedNodes = positionDocuments(nodes);
        visualizationData.set(positionedNodes);
    } catch (error) {
        console.error("Failed to fetch or process data:", error);
    }
}

function positionDocuments(documents: any[]) {
    let angleIncrement = 360 / documents.length;
    let radius = 5;  // Base radius which can be adjusted based on the size of the visualization

    return documents.map((doc: { connections: any[]; id: any; }, index: number) => {
        let connectedDocs = doc.connections.map((id: any) => documents.findIndex((d: { id: any; }) => d.id === id));
        let averageAngle = connectedDocs.reduce((acc: number, i: number) => acc + (i * angleIncrement), 0) / connectedDocs.length;

        if (connectedDocs.length === 0) {
            averageAngle = index * angleIncrement;
        }

        // Convert degrees to radians for x and z calculations
        let radian = (averageAngle * Math.PI) / 180;
        let x = radius * Math.cos(radian);
        let z = radius * Math.sin(radian);

        return {
            id: doc.id,
            x: x,
            y: 0,
            z: z,
            connections: doc.connections,
        };
    });
}

fetchData();
