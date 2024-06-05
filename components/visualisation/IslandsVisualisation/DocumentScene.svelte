<script lang="ts">
  import { T, useFrame } from '@threlte/core';
  import { ClusterCenter, DocumentDetail } from 'model';
  import * as THREE from 'three';
  import { writable } from 'svelte/store';
  import {
    distance_threshold,
    min_visibility_distance,
    max_cluster_visibility_distance,
    cluster_radius,
    min_cluster_visibility_distance,
    selectedDocument
  } from './parameters';
  import Modal from './Modal.svelte';
  import { calculateClusters, clusterCenters } from './Calculations/calculateClusters';
  import { generateIslandData } from './Calculations/islandsPlacement';
  import ClusterTitle from './TextElements/ClusterTitle.svelte';
  import DocumentTitle from './TextElements/DocumentTitle.svelte';

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
  const islands = writable<any[]>([]);
  let cameraPosition = new THREE.Vector3();

  // Initialize values from the stores
  let currentDistanceThreshold: number;
  let currentMinVisibilityDistance: number;
  let currentClusterRadius: number;
  let currentMinClusterVisibilityDistance: number;
  let currentMaxClusterVisibilityDistance: number;

  distance_threshold.subscribe((value: number) => {
    currentDistanceThreshold = value;
  });

  min_visibility_distance.subscribe((value: number) => {
    currentMinVisibilityDistance = value;
  });

  cluster_radius.subscribe((value: number) => {
    currentClusterRadius = value;
  });

  min_cluster_visibility_distance.subscribe((value: number) => {
    currentMinClusterVisibilityDistance = value;
  });

  max_cluster_visibility_distance.subscribe((value: number) => {
    currentMaxClusterVisibilityDistance = value;
  });

  function convertPosition(documentId: string): [number, number, number] {
    const pos = nodePositions[documentId];
    return [pos.x, pos.y, pos.z];
  }

  function handleDocumentClick(document: DocumentDetail) {
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
    const rotation = [0, Math.random() * Math.PI * 2, 0];
    return { ...models[randomIndex], rotation };
  }

  clusterCenters.subscribe((value: { [key: string]: ClusterCenter; }) => {
    const islandData = generateIslandData(value, documents, nodePositions);
    islands.set(islandData);
  });

  useFrame(({ camera }) => {
    cameraPosition.copy(camera.current.position);
    const visibility: { [key: string]: boolean } = {};

    // Calculate visibility for documents
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
    // Recalculate clusters
    calculateClusters(documents, nodePositions, cameraPosition, currentClusterRadius, currentMinClusterVisibilityDistance, currentMaxClusterVisibilityDistance);
  });

</script>

<!-- Svelte markup -->
{#each $islands as island (island.position)}
  <T.Group position={island.position} scale={island.scale}>
    <svelte:component this={island.component} />
  </T.Group>
{/each}

{#each documents as document (document.documentId)}
  <T.Group position={convertPosition(document.documentId)} on:click={() => handleDocumentClick(document)}>
    {#await getRandomModel() then { component, scale, rotation, yOffset }}
      <T.Group position={[0, yOffset, 0]}>
        <svelte:component this={component} scale={scale} rotation={rotation} />
      </T.Group>
    {/await}
    {#if $documentVisibility[document.documentId]}
      <DocumentTitle 
        position={[0, 1.5, 0]}
        text={document.documentId || 'Unnamed Document'}
        keywords={document.keywords || []}
      />
    {/if}
  </T.Group>
{/each}


{#each Object.entries($clusterCenters) as [index, center]}
  {#if center.visible}
    <ClusterTitle 
      position={[center.x, center.y, center.z]} 
      text={center.topics.join(', ')} 
      cameraPosition={cameraPosition} />
  {/if}
{/each}

<Modal />
