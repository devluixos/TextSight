<script lang="ts">
    import { onMount } from 'svelte';
    import { T, useFrame } from '@threlte/core';
    import { Billboard, Text } from '@threlte/extras';
    import { DocumentDetail } from 'model';
    import * as THREE from 'three';
    import { writable } from 'svelte/store';
    import {
      distance_threshold,
      min_visibility_distance,
      max_cluster_visibility_distance,
      cluster_radius,
      min_cluster_visibility_distance
    } from './parameters';
  
    export let documents: DocumentDetail[] = [];
    export let nodePositions: { [key: string]: { x: number, y: number, z: number } } = {};
    const documentVisibility = writable<{ [key: string]: boolean }>({});
    const clusterCenters = writable<{ [key: string]: ClusterCenter }>({});
    let cameraRef: THREE.PerspectiveCamera | null = null;
  
    interface ClusterCenter {
      x: number;
      y: number;
      z: number;
      topics: string[];
      visible: boolean;
    }
  
    // Initialize values from the stores
    let currentDistanceThreshold: number;
    let currentMinVisibilityDistance: number;
    let currentClusterRadius: number;
    let currentMinClusterVisibilityDistance: number;
    let currentMaxClusterVisibilityDistance: number;
  
    distance_threshold.subscribe(value => {
      currentDistanceThreshold = value;
    });
  
    min_visibility_distance.subscribe(value => {
      currentMinVisibilityDistance = value;
    });
  
    cluster_radius.subscribe(value => {
      currentClusterRadius = value;
    });
  
    min_cluster_visibility_distance.subscribe(value => {
      currentMinClusterVisibilityDistance = value;
    });
  
    max_cluster_visibility_distance.subscribe(value => {
      currentMaxClusterVisibilityDistance = value;
    });
  
    function convertPosition(documentId: string): [number, number, number] {
      const pos = nodePositions[documentId];
      return [pos.x, pos.y, pos.z];
    }
  
    useFrame(({ camera }) => {
      const cameraPosition = camera.current.position;
      const visibility: { [key: string]: boolean } = {};
      documents.forEach(doc => {
        const docPosition = new THREE.Vector3(
          nodePositions[doc.documentId].x,
          nodePositions[doc.documentId].y,
          nodePositions[doc.documentId].z
        );
        const distance = cameraPosition.distanceTo(docPosition);
        visibility[doc.documentId] = distance <= currentDistanceThreshold && distance >= currentMinVisibilityDistance;
      });
      documentVisibility.set(visibility);
      calculateClusters(cameraPosition, currentClusterRadius, currentMinClusterVisibilityDistance, currentMaxClusterVisibilityDistance);
    });
  
    function calculateClusters(cameraPosition: THREE.Vector3, clusterRadius: number, minClusterVisibilityDistance: number, maxClusterVisibilityDistance: number) {
      const clusters: { x: number; y: number; z: number; documents: DocumentDetail[]; }[] = [];
      const clusterMap: { [key: string]: boolean } = {};
  
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
          visible: distance >= minClusterVisibilityDistance && distance <= maxClusterVisibilityDistance
        };
      });
  
      clusterCenters.set(clusterCenterData);
    }
  
    function handleDocumentClick(document: DocumentDetail) {
      console.log("Document clicked:", document);
    }
  </script>
  
  {#each documents as document}
    <T.Group position={convertPosition(document.documentId)}>
      <T.Mesh name={document.documentId} on:click={() => handleDocumentClick(document)}>
        <T.BoxGeometry args={[1, 1, 1]} />
        <T.MeshStandardMaterial color='#ffcc00' />
      </T.Mesh>
      {#if $documentVisibility[document.documentId]}
        <Billboard>
          <Text
            fontSize={0.5}
            position={[0, 1.5, 0]}
            text={document.documentId || 'Unnamed Document'}
            color='white'
            anchorX="center"
            anchorY="middle"
          />
        </Billboard>
      {/if}
    </T.Group>
  {/each}
  
  {#each Object.entries($clusterCenters) as [index, center]}
    {#if center.visible}
      <T.Group position={[center.x, center.y, center.z]}>
        <Billboard>
          <Text
            fontSize={1}
            position={[0, 1.5, 0]}
            text={center.topics.join(', ')}
            color='blue'
            anchorX="center"
            anchorY="middle"
          />
        </Billboard>
      </T.Group>
    {/if}
  {/each}
  