import * as THREE from 'three';
import { writable } from 'svelte/store';
import { ClusterCenter, DocumentDetail } from '../../../../model';

export const clusterCenters = writable<{ [key: string]: ClusterCenter }>({});

export function calculateClusters(
  documents: DocumentDetail[],
  nodePositions: { [key: string]: { x: number, y: number, z: number } },
  cameraPosition: THREE.Vector3,
  clusterRadius: number,
  minClusterVisibilityDistance: number,
  maxClusterVisibilityDistance: number
) {
  const clusters: { x: number; y: number; z: number; documents: DocumentDetail[]; }[] = [];

  documents.forEach(doc => {
    const docPosition = new THREE.Vector3(
      nodePositions[doc.documentId].x,
      nodePositions[doc.documentId].y,
      nodePositions[doc.documentId].z
    );
    let foundCluster = false;
    for (let cluster of clusters) {
      const clusterCenter = new THREE.Vector3(cluster.x, cluster.y, cluster.z);
      if (docPosition.distanceTo(clusterCenter) <= clusterRadius) {
        cluster.documents.push(doc);
        foundCluster = true;
        break;
      }
    }
    if (!foundCluster) {
      clusters.push({ x: docPosition.x, y: docPosition.y, z: docPosition.z, documents: [doc] });
    }
  });

  const clusterCenterData: { [key: string]: ClusterCenter } = {};
  clusters.forEach((cluster, index) => {
    const topics: { [key: string]: number } = {};
    cluster.documents.forEach(doc => {
      doc.topics.forEach(topic => {
        if (!topics[topic.name]) {
          topics[topic.name] = 0;
        }
        topics[topic.name] += topic.weight;
      });
    });

    const sortedTopics = Object.entries(topics).sort((a, b) => b[1] - a[1]).map(entry => entry[0]);
    const distance = cameraPosition.distanceTo(new THREE.Vector3(cluster.x, cluster.y, cluster.z));
    clusterCenterData[index.toString()] = {
      x: cluster.x,
      y: cluster.y,
      z: cluster.z,
      topics: sortedTopics.slice(0, 3),
      visible: distance >= minClusterVisibilityDistance && distance <= maxClusterVisibilityDistance,
      documents: cluster.documents
    };
  });

  clusterCenters.set(clusterCenterData);
}
