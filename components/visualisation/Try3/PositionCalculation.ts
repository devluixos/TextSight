// Import your database configuration and required libraries
import { DocumentDetail } from 'model';
import { fetchDetailedDocumentData } from 'sqlite/sqlHandler';

// Define the width and height of the canvas
const width = 100;
const height = 100;
const centerForceStrength = 0.1;  // Reduced to bring nodes closer to the center
const repulsionStrength = 0.1;    // Reduced to decrease the repulsive force
const attractionStrength = 0.5;    // Increased to make the nodes attract each other more strongly
const maxIterations = 500;

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: string[];
}

interface Link {
  source: string;
  target: string;
}

async function loadAndProcessData() {
    try {
        const detailedDocuments = await fetchDetailedDocumentData();
        return detailedDocuments;
    } catch (error) {
        console.error("Failed to fetch detailed documents:", error);
        return [];
    }
}

function initializeNodes(documents: DocumentDetail[]): Node[] {
  return documents.map(doc => ({
    id: doc.documentId,
    x: Math.random() * width,
    y: Math.random() * height,
    vx: 0,
    vy: 0,
    connections: doc.connections.map(conn => conn.connectedDocumentId)
  }));
}

function applyForces(nodes: Node[]) {
  nodes.forEach(node => {
    // Reset forces
    node.vx = 0;
    node.vy = 0;

    // Centering force
    const dx = width / 2 - node.x;
    const dy = height / 2 - node.y;
    node.vx += dx * centerForceStrength;
    node.vy += dy * centerForceStrength;

    nodes.forEach(other => {
      if (node.id !== other.id) {
        // Repulsive force
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsionStrength / (distance * distance);
        node.vx += (dx / distance) * force;
        node.vy += (dy / distance) * force;
      }
    });

    node.connections.forEach(connId => {
      const targetNode = nodes.find(n => n.id === connId);
      if (targetNode) {
        // Attractive force
        const dx = targetNode.x - node.x;
        const dy = targetNode.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (distance * distance) * attractionStrength;
        node.vx += (dx / distance) * force;
        node.vy += (dy / distance) * force;
        targetNode.vx -= (dx / distance) * force;
        targetNode.vy -= (dy / distance) * force;
      }
    });
  });

  nodes.forEach(node => {
    node.x += node.vx;
    node.y += node.vy;
  });
}

export function forceDirectedLayout(documents: DocumentDetail[]) {
  const nodes = initializeNodes(documents);

  for (let i = 0; i < maxIterations; i++) {
    applyForces(nodes);
  }

  return nodes;
}
