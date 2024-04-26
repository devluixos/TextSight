import { writable } from 'svelte/store';
import { fetchDetailedDocumentData } from 'sqlite/sqlHandler';

// Constants for layout
const MIN_ISLAND_SIZE = 2;
const MAX_ISLAND_SIZE = 10;
const BLOCK_SIZE = 1;

export const isConnectionAnalysisLoading = writable(false);

// Function to layout positions for blocks within an island based on count
function layoutPositions(count: number): { x: number, z: number }[] {
    let positions = [];
    let gridSize = Math.ceil(Math.sqrt(count));
    gridSize = Math.max(MIN_ISLAND_SIZE, gridSize);
    for (let i = 0; i < gridSize * gridSize; i++) {
        let x = (i % gridSize) * BLOCK_SIZE;
        let z = Math.floor(i / gridSize) * BLOCK_SIZE;
        positions.push({ x, z });
    }
    return positions;
}

// Generate document islands using detailed document data
export async function generateDocumentIslands(): Promise<any[]> {
    const detailedDocs = await fetchDetailedDocumentData();
    let islands: any[] = [];
    let documentPositions = [{ x: 0, y: 0, z: 0 }]; // Start the first document at the origin

    detailedDocs.forEach((doc, idx) => {
        if (idx > 0) {
            let x = 0, z = 0, count = 0;
            doc.connections.forEach((connection: { connectedDocumentId: any; }) => {
                const connectedDocIndex = detailedDocs.findIndex(d => d.documentId === connection.connectedDocumentId);
                if (connectedDocIndex !== -1 && connectedDocIndex < idx) {
                    x += documentPositions[connectedDocIndex].x;
                    z += documentPositions[connectedDocIndex].z;
                    count++;
                }
            });
            if (count > 0) {
                x /= count;
                z /= count;
            }
            // Place this document slightly away from the centroid of its connections
            documentPositions.push({ x: x + (Math.random() - 0.5) * 30, y: 0, z: z + (Math.random() - 0.5) * 30 });
        }

        const numAttributes = doc.entities.length + doc.keywords.length + doc.topics.length;
        const gridSize = Math.min(Math.max(MIN_ISLAND_SIZE, Math.ceil(Math.sqrt(numAttributes))), MAX_ISLAND_SIZE);
        const positions = layoutPositions(gridSize);

        const models = positions.map(pos => ({
            model: 'path/to/grassBlock.glb',
            x: pos.x + documentPositions[idx].x,
            z: pos.z + documentPositions[idx].z,
            scale: 1.5,
            dataInfo: JSON.stringify({
                title: doc.documentId,
                description: `Entities: ${doc.entities.length}, Keywords: ${doc.keywords.length}, Topics: ${doc.topics.length}`
            })
        }));

        islands.push({ documentId: doc.documentId, models });
    });

    return islands;
}
