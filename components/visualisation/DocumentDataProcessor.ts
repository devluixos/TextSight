import { DocumentDetail } from 'model';
import { fetchDetailedDocumentData } from '../../sqlite/sqlHandler';

// Parameters
let width = 20;
let height = 20;
let maxIterations = 2000;
let scale = 0.5;
let connectionStrength = 0.1;
let repulsionStrength = 0.3;
let clusterRepulsionStrength = 0.2;
let centralAttractionStrength = 0.02;
let minDistance = 5;
let centralPoint = { x: 0, y: 0, z: 0 };

// Set parameters function
export function setParameters(params: {
  width?: number,
  height?: number,
  maxIterations?: number,
  scale?: number,
  connectionStrength?: number,
  repulsionStrength?: number,
  clusterRepulsionStrength?: number,
  centralAttractionStrength?: number,
  minDistance?: number,
  centralPoint?: { x: number, y: number, z: number }
}) {
  if (params.width !== undefined) width = params.width;
  if (params.height !== undefined) height = params.height;
  if (params.maxIterations !== undefined) maxIterations = params.maxIterations;
  if (params.scale !== undefined) scale = params.scale;
  if (params.connectionStrength !== undefined) connectionStrength = params.connectionStrength;
  if (params.repulsionStrength !== undefined) repulsionStrength = params.repulsionStrength;
  if (params.clusterRepulsionStrength !== undefined) clusterRepulsionStrength = params.clusterRepulsionStrength;
  if (params.centralAttractionStrength !== undefined) centralAttractionStrength = params.centralAttractionStrength;
  if (params.minDistance !== undefined) minDistance = params.minDistance;
  if (params.centralPoint !== undefined) centralPoint = params.centralPoint;
}

// Identify clusters
function identifyClusters(documents: DocumentDetail[]): DocumentDetail[][] {
  const clusters: DocumentDetail[][] = [];
  const visited = new Set<string>();

  function dfs(document: DocumentDetail, cluster: DocumentDetail[]) {
    visited.add(document.documentId);
    cluster.push(document);
    document.connections.forEach(conn => {
      const targetDoc = documents.find(d => d.documentId === conn.connectedDocumentId);
      if (targetDoc && !visited.has(targetDoc.documentId)) {
        dfs(targetDoc, cluster);
      }
    });
  }

  documents.forEach(doc => {
    if (!visited.has(doc.documentId)) {
      const cluster: DocumentDetail[] = [];
      dfs(doc, cluster);
      clusters.push(cluster);
    }
  });

  return clusters;
}

// Improved clustered layout
export function improvedClusteredLayout(documents: DocumentDetail[]): DocumentDetail[] {
  const clusters = identifyClusters(documents);
  const k = Math.sqrt((width * height) / documents.length);

  clusters.forEach(cluster => {
    const clusterCenter = {
      x: (Math.random() * width - width / 2) * scale,
      y: 0,
      z: (Math.random() * height - height / 2) * scale
    };

    cluster.forEach(doc => {
      if (!doc.position) {
        doc.position = {
          x: clusterCenter.x + (Math.random() * width - width / 2) * scale,
          y: 0,
          z: clusterCenter.z + (Math.random() * height - height / 2) * scale
        };
      }
      if (!doc.force) {
        doc.force = { x: 0, y: 0, z: 0 };
      }
    });

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      cluster.forEach((doc1, i) => {
        doc1.force = { x: 0, y: 0, z: 0 };
        cluster.forEach((doc2, j) => {
          if (i !== j) {
            const dx = doc1.position!.x - doc2.position!.x;
            const dz = doc1.position!.z - doc2.position!.z;
            const distance = Math.sqrt(dx * dx + dz * dz) || 1;
            if (distance < minDistance) {
              const repulsiveForce = (minDistance - distance) * repulsionStrength;
              doc1.force!.x += (dx / distance) * repulsiveForce;
              doc1.force!.z += (dz / distance) * repulsiveForce;
            }
          }
        });
      });

      cluster.forEach(doc => {
        doc.connections.forEach(conn => {
          const targetDoc = cluster.find(d => d.documentId === conn.connectedDocumentId);
          if (targetDoc) {
            const dx = doc.position!.x - targetDoc.position!.x;
            const dz = doc.position!.z - targetDoc.position!.z;
            const distance = Math.sqrt(dx * dx + dz * dz) || 1;
            const attractiveForce = (distance * distance) / k * connectionStrength;
            doc.force!.x -= (dx / distance) * attractiveForce;
            doc.force!.z -= (dz / distance) * attractiveForce;
            targetDoc.force!.x += (dx / distance) * attractiveForce;
            targetDoc.force!.z += (dz / distance) * attractiveForce;
          }
        });
      });

      cluster.forEach(doc => {
        doc.position!.x += doc.force!.x;
        doc.position!.z += doc.force!.z;
        doc.position!.x = Math.min(width / 2, Math.max(-width / 2, doc.position!.x));
        doc.position!.z = Math.min(height / 2, Math.max(-height / 2, doc.position!.z));
      });
    }
  });

  clusters.forEach(cluster => {
    cluster.forEach(doc => {
      const dx = centralPoint.x - doc.position!.x;
      const dz = centralPoint.z - doc.position!.z;
      doc.position!.x += dx * centralAttractionStrength;
      doc.position!.z += dz * centralAttractionStrength;
      doc.position!.x = Math.min(width / 2, Math.max(-width / 2, doc.position!.x));
      doc.position!.z = Math.min(height / 2, Math.max(-height / 2, doc.position!.z));
    });
  });

  return documents;
}
