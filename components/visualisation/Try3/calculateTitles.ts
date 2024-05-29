import { DocumentDetail } from 'model';

function calculateTopicCenters(documents: DocumentDetail[], positions: { [key: string]: { x: number; y: number; z: number } }, radius: number): { [topic: string]: { position: { x: number; y: number; z: number }, count: number } } {
  const topicCenters: { [topic: string]: { x: number; y: number; z: number, count: number } } = {};

  documents.forEach(doc => {
    const docPos = positions[doc.documentId];
    doc.topics.forEach(topic => {
      if (!topicCenters[topic]) {
        topicCenters[topic] = { x: 0, y: 0, z: 0, count: 0 };
      }
      documents.forEach(otherDoc => {
        const otherPos = positions[otherDoc.documentId];
        const dx = otherPos.x - docPos.x;
        const dz = otherPos.z - docPos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance < radius) {
          topicCenters[topic].x += otherPos.x;
          topicCenters[topic].y += otherPos.y;
          topicCenters[topic].z += otherPos.z;
          topicCenters[topic].count += 1;
        }
      });
    });
  });

  let result: { [topic: string]: { position: { x: number; y: number; z: number }, count: number } } = {};
  Object.keys(topicCenters).forEach(topic => {
    const center = topicCenters[topic];
    result[topic] = {
      position: {
        x: center.x / center.count,
        y: (center.y / center.count) + 2, // Slightly above the average position
        z: center.z / center.count
      },
      count: center.count // Add the missing count property
    };
  });

  return result;
}

export { calculateTopicCenters };
