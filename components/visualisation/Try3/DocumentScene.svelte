<script lang="ts">
  import { onMount } from 'svelte';
  import { T, useFrame } from '@threlte/core';
  import { Billboard, HTML, Text } from '@threlte/extras';
  import { ClusterCenter, DocumentDetail } from 'model';
  import * as THREE from 'three';
  import { writable, get } from 'svelte/store';
  import {
    distance_threshold,
    min_visibility_distance,
    max_cluster_visibility_distance,
    cluster_radius,
    min_cluster_visibility_distance,
    selectedDocument
  } from './parameters';
  import Modal from './Modal.svelte';
  import { calculateClusters, clusterCenters } from './calculateClusters';
  import { generateIslandData } from './islandsPlacement';

  // Models
  import tree1 from './ConvertedElements/tree1.svelte';
  import tree2 from './ConvertedElements/tree2.svelte';
  import tree3 from './ConvertedElements/tree3.svelte';
  import tree4 from './ConvertedElements/tree4.svelte';
  import tree5 from './ConvertedElements/tree5.svelte';
  import rock1 from './ConvertedElements/rock1.svelte';
  import rock2 from './ConvertedElements/rock2.svelte';
  import rock3 from './ConvertedElements/rock3.svelte';
  import house1 from './ConvertedElements/house1.svelte';
  import bench1 from './ConvertedElements/bench1.svelte';

  export let documents: DocumentDetail[] = [];
  export let nodePositions: { [key: string]: { x: number, y: number, z: number } } = {};
  const documentVisibility = writable<{ [key: string]: boolean }>({});
  const islands = writable<any[]>([]); // Store for islands

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

  function handleDocumentClick(document: DocumentDetail) {
    console.log("Document clicked:", document);
    selectedDocument.set({ document, position: convertPosition(document.documentId) });
  }

  function getRandomModel() {
    const models = [
      { component: tree1, scale: 2, yOffset: 2.5 },
      { component: tree2, scale: 2, yOffset: 2.5 },
      { component: tree3, scale: 2, yOffset: 3 },
      { component: tree4, scale: 3, yOffset: 0 },
      { component: tree5, scale: 0.5, yOffset: 0 },
      { component: rock1, scale: 0.5, yOffset: 0 },
      { component: rock2, scale: 0.5, yOffset: 0 },
      { component: rock3, scale: 7, yOffset: 0 },
      { component: house1, scale: 2, yOffset: 1.1 },
      { component: bench1, scale: 2, yOffset: 0 }
    ];
    const randomIndex = Math.floor(Math.random() * models.length);
    const rotation = [0, Math.random() * Math.PI * 2, 0]; // Random rotation around the Y-axis
    return { ...models[randomIndex], rotation };
  }


  clusterCenters.subscribe(value => {    
    console.log("Cluster centers:", value);
    const islandData = generateIslandData(value, documents, nodePositions);
    islands.set(islandData);
  });

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
    calculateClusters(documents, nodePositions, cameraPosition, currentClusterRadius, currentMinClusterVisibilityDistance, currentMaxClusterVisibilityDistance);
  });
</script>

<!-- Svelte markup -->

{#each $islands as island (island.position)}
  {#if island.visible}
    <T.Group position={island.position} scale={[island.scale, island.scale, island.scale]}>
      <svelte:component this={island.component} />
    </T.Group>
  {/if}
{/each}

{#each documents as document (document.documentId)}
  <T.Group position={convertPosition(document.documentId)} on:click={() => handleDocumentClick(document)}>
    {#await getRandomModel() then { component, scale, rotation, yOffset }}
      <T.Group position={[0, yOffset, 0]}>
        <svelte:component this={component} scale={scale} rotation={rotation} />
      </T.Group>
    {/await}

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

<Modal />
