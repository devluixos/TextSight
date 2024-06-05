import { DocumentDetail } from '../../../../model';

const SCALING_FACTOR = 2;  // Adjust this value to increase cluster separation
const REPULSIVE_FORCE = 20; // Increased value to set the strength of the repulsive force
const MIN_DISTANCE = 5;  // Increased minimum distance to ensure no overlap

function initializeRandomPositions(documents: DocumentDetail[]): { [key: string]: { x: number; y: number; z: number } } {
  const positions: { [key: string]: { x: number; y: number; z: number } } = {};
  documents.forEach(doc => {
    positions[doc.documentId] = {
      x: (Math.random() * 50 - 25) * SCALING_FACTOR,
      y: 0,  // Keep y constant
      z: (Math.random() * 50 - 25) * SCALING_FACTOR
    };
  });
  return positions;
}

function calculateInfluences(documents: DocumentDetail[], positions: { [key: string]: { x: number; y: number; z: number } }): { [key: string]: { fx: number; fy: number; fz: number } } {
  const influences: { [key: string]: { fx: number; fy: number; fz: number } } = {};

  documents.forEach(doc => {
    influences[doc.documentId] = { fx: 0, fy: 0, fz: 0 };

    // Calculate influence from connections
    doc.connections.forEach(conn => {
      const targetPos = positions[conn.connectedDocumentId];
      const dx = targetPos.x - positions[doc.documentId].x;
      const dz = targetPos.z - positions[doc.documentId].z;
      const distance = Math.sqrt(dx * dx + dz * dz) || 1;
      const force = conn.weight / distance;

      influences[doc.documentId].fx += (dx / distance) * force;
      influences[doc.documentId].fz += (dz / distance) * force;
    });

    // Calculate influence from shared keywords and topics
    doc.keywords.forEach(keyword => {
      documents.forEach(otherDoc => {
        if (doc.documentId !== otherDoc.documentId && otherDoc.keywords.includes(keyword)) {
          const otherPos = positions[otherDoc.documentId];
          const dx = otherPos.x - positions[doc.documentId].x;
          const dz = otherPos.z - positions[doc.documentId].z;
          const distance = Math.sqrt(dx * dx + dz * dz) || 1;
          const force = 1 / distance; // Assuming weight for keyword influence is 1

          influences[doc.documentId].fx += (dx / distance) * force;
          influences[doc.documentId].fz += (dz / distance) * force;
        }
      });
    });

    // Add repulsive force for unrelated nodes
    documents.forEach(otherDoc => {
      if (doc.documentId !== otherDoc.documentId) {
        const otherPos = positions[otherDoc.documentId];
        const dx = otherPos.x - positions[doc.documentId].x;
        const dz = otherPos.z - positions[doc.documentId].z;
        const distance = Math.sqrt(dx * dx + dz * dz) || 1;

        // Check if nodes share connections, keywords, or topics
        const shareConnection = doc.connections.some(conn => conn.connectedDocumentId === otherDoc.documentId);
        const shareKeyword = doc.keywords.some(keyword => otherDoc.keywords.includes(keyword));
        const shareTopic = doc.topics.some(topic => otherDoc.topics.includes(topic));

        if (!shareConnection && !shareKeyword && !shareTopic) {
          const repulsiveForce = REPULSIVE_FORCE / (distance * distance);

          influences[doc.documentId].fx -= (dx / distance) * repulsiveForce;
          influences[doc.documentId].fz -= (dz / distance) * repulsiveForce;
        }
      }
    });
  });

  return influences;
}

function applyForces(documents: DocumentDetail[], positions: { [key: string]: { x: number; y: number; z: number } }, influences: { [key: string]: { fx: number; fy: number; fz: number } }, centerPull: number): void {
  documents.forEach(doc => {
    positions[doc.documentId].x += influences[doc.documentId].fx + (0 - positions[doc.documentId].x) * centerPull;
    positions[doc.documentId].z += influences[doc.documentId].fz + (0 - positions[doc.documentId].z) * centerPull;
    // Y remains constant
  });
}

function adjustForNonOverlap(documents: DocumentDetail[], positions: { [key: string]: { x: number; y: number; z: number } }, minDistance: number): void {
  const minDistSquared = minDistance * minDistance;

  for (let i = 0; i < documents.length; i++) {
    for (let j = i + 1; j < documents.length; j++) {
      const pos1 = positions[documents[i].documentId];
      const pos2 = positions[documents[j].documentId];
      const dx = pos2.x - pos1.x;
      const dz = pos2.z - pos1.z;
      const distSquared = dx * dx + dz * dz;

      if (distSquared < minDistSquared) {
        const distance = Math.sqrt(distSquared);
        const overlap = (minDistance - distance) / 2;
        const nx = dx / distance;
        const nz = dz / distance;

        pos1.x -= nx * overlap;
        pos1.z -= nz * overlap;

        pos2.x += nx * overlap;
        pos2.z += nz * overlap;
      }
    }
  }
}

function runLayout(documents: DocumentDetail[], iterations: number, centerPull: number): { [key: string]: { x: number, y: number, z: number } } {
  let positions = initializeRandomPositions(documents);

  for (let i = 0; i < iterations; i++) {
    const influences = calculateInfluences(documents, positions);
    applyForces(documents, positions, influences, centerPull);
    adjustForNonOverlap(documents, positions, MIN_DISTANCE);
  }

  return positions;
}

function calculateClusterCenters(documents: DocumentDetail[], positions: { [key: string]: { x: number; y: number; z: number } }): { [key: string]: { x: number; y: number; z: number } } {
  const clusterCenters: { [key: string]: { x: number; y: number; z: number } } = {};
  const clusters: { [key: string]: DocumentDetail[] } = {};

  documents.forEach(doc => {
    const clusterId = doc.topics.length > 0 ? doc.topics[0] : doc.documentId;
    if (!clusters[clusterId]) {
      clusters[clusterId] = [];
    }
    clusters[clusterId].push(doc);
  });

  Object.keys(clusters).forEach(clusterId => {
    const cluster = clusters[clusterId];
    const center = { x: 0, y: 0, z: 0 };
    cluster.forEach(doc => {
      center.x += positions[doc.documentId].x;
      center.y += positions[doc.documentId].y;
      center.z += positions[doc.documentId].z;
    });
    center.x /= cluster.length;
    center.y /= cluster.length;
    center.z /= cluster.length;
    clusterCenters[clusterId] = center;
  });

  return clusterCenters;
}

export { runLayout, calculateClusterCenters };
