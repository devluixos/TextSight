import { fetchDetailedDocumentData } from 'sqlite/sqlHandler';
import { DocumentDetail } from 'model';

export async function fetchAndProcessData() {
  const documents = await fetchDetailedDocumentData();
  const nodes = documents.map(doc => ({ id: doc.documentId, data: doc }));
  const edges: { source: string; target: string; weight: number; }[] = [];

  documents.forEach(doc => {
    doc.connections.forEach(conn => {
      edges.push({ source: doc.documentId, target: conn.connectedDocumentId, weight: conn.weight });
    });
  });

  console.log("Nodes:", nodes);
  console.log("Edges:", edges);

  return { nodes, edges };
}
