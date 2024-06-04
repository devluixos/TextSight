import island1 from './ConvertedElements/island1.svelte';
import island2 from './ConvertedElements/island2.svelte';
import island3 from './ConvertedElements/island3.svelte';
import { ClusterCenter, DocumentDetail } from 'model';

const ISLAND1_SCALE = 15; // Adjust this scale as needed
const ISLAND2_SCALE = 15;
const ISLAND3_SCALE = 18; 

const ISLAND1_Y_OFFSET = -11.1; // Adjust this offset as needed to lower the islands
const ISLAND2_Y_OFFSET = -22.8; 
const ISLAND3_Y_OFFSET = -25.3; 

export function getIslandForCluster(size: number) {
    if (size <= 2) return island1;
    if (size <= 4) return island2;
    return island3;
}

export function getScaleForCluster(size: number): number {
    if (size <= 2) {
        return ISLAND1_SCALE;
    } 
    else if (size >= 3 && size <= 4) {
        return ISLAND2_SCALE;
    } else {
        return ISLAND3_SCALE;
    }
}

export function getYOffsetForCluster(size: number): number {
  if (size <= 2) return ISLAND1_Y_OFFSET;
  if (size <= 4) return ISLAND2_Y_OFFSET;
  return ISLAND3_Y_OFFSET;
}

export function generateIslandData(clusterCenters: { [key: string]: ClusterCenter }, documents: DocumentDetail[], nodePositions: { [key: string]: { x: number, y: number, z: number } }) {
  return Object.entries(clusterCenters).map(([index, center]) => {
    const clusterDocuments = documents.filter(doc => {
      const pos = nodePositions[doc.documentId];
      const inCluster = (
        Math.abs(pos.x - center.x) < 10 &&  // Increased threshold to 10 for debugging
        Math.abs(pos.y - center.y) < 10 &&
        Math.abs(pos.z - center.z) < 10
      );
      return inCluster;
    });

    const size = clusterDocuments.length;
    return {
      position: [center.x, center.y + getYOffsetForCluster(size), center.z] as [number, number, number],
      scale: getScaleForCluster(size),
      component: getIslandForCluster(size),
      visible: center.visible
    };
  });
}
