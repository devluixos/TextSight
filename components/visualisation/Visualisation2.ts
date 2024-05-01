import { writable } from 'svelte/store';
import { db } from '../../sqlite/sqlHandler';  // Ensure the import path is correct

export const visualizationData = writable<any[]>([]);

interface Node {
  id: string;
  x: number;
  y: number;
  z: number;
  connections: string[];
}

// Function to calculate initial positions using a radial layout
function calculatePositions(nodes: Node[], center: { x: number; y: number; }, radiusBase: number, radiusIncrement: number): Node[] {
  return nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;  // Distribute nodes evenly around the circle
    const radius = radiusBase + (node.connections.length * radiusIncrement);  // Closer to the center if more connections
    return {
      ...node,
      x: center.x + radius * Math.cos(angle),
      y: 0,  // Keep y constant if not using 3D vertical positioning
      z: center.y + radius * Math.sin(angle)
    };
  });
}

// Fetching data and processing nodes
async function fetchData() {
    try {
        const documents = await db.documents.toArray();
        const connections = await db.documentConnections.toArray();

        // Map connections to documents
        const nodes = documents.map((doc: { documentId: any; }) => ({
            id: doc.documentId,
            x: 0,  // Initial x, y, z positions are set in calculatePositions
            y: 0,
            z: 0,
            connections: connections.filter((conn: { documentId: any; }) => conn.documentId === doc.documentId).map((conn: { connectedDocumentId: any; }) => conn.connectedDocumentId),
        }));

        // Parameters for layout
        const center = { x: 0, y: 0 };
        const radiusBase = 5;  // Starting radius
        const radiusIncrement = 3;  // Increment per connection

        // Calculate and adjust positions
        const positionedNodes = calculatePositions(nodes, center, radiusBase, radiusIncrement);
        visualizationData.set(positionedNodes);
    } catch (error) {
        console.error("Failed to fetch or process data:", error);
    }
}

fetchData();
