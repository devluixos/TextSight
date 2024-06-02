<script lang="ts">
  import { onMount } from 'svelte';
  import { T, useFrame } from '@threlte/core';
  import { Billboard, HTML, Text } from '@threlte/extras';
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
  import { calculateClusters, clusterCenters } from './calculateClusters';

  // Models
  import tree1 from './ConvertedElements/tree1.svelte';
  import tree2 from './ConvertedElements/tree2.svelte';
  import tree3 from './ConvertedElements/tree3.svelte';
  import tree4 from './ConvertedElements/tree4.svelte';
  import rock1 from './ConvertedElements/rock1.svelte';
  import rock2 from './ConvertedElements/rock2.svelte';
  import rock3 from './ConvertedElements/rock3.svelte';
  import house1 from './ConvertedElements/house1.svelte';
	import Ground from './Ground.svelte';

  export let documents: DocumentDetail[] = [];
  export let nodePositions: { [key: string]: { x: number, y: number, z: number } } = {};
  const documentVisibility = writable<{ [key: string]: boolean }>({});

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
    calculateClusters(documents, nodePositions, cameraPosition, currentClusterRadius, currentMinClusterVisibilityDistance, currentMaxClusterVisibilityDistance);
  });

  function handleDocumentClick(document: DocumentDetail) {
    console.log("Document clicked:", document);
    selectedDocument.set({ document, position: convertPosition(document.documentId) });
  }

  // Function to randomly assign models to clusters
  function getRandomModel() {
    const models = [
      { component: tree1, scale: 1 },
      { component: tree2, scale: 0.05 },
      { component: tree3, scale: 1 },
      { component: tree4, scale: 0.5 },
      { component: rock1, scale: 2 },
      { component: rock2, scale: 4 },
      { component: rock3, scale: 7 },
      { component: house1, scale: 1.3 }
    ];
    const randomIndex = Math.floor(Math.random() * models.length);
    const rotation = [0, Math.random() * Math.PI * 2, 0]; // Random rotation around the Y-axis
    return { ...models[randomIndex], rotation };
  }
</script>

<!-- Svelte markup -->
<Ground />

{#each documents as document (document.documentId)}
  <T.Group position={convertPosition(document.documentId)} on:click={() => handleDocumentClick(document)}>
    {#await getRandomModel() then { component, scale, rotation }}
      <svelte:component this={component} scale={scale} rotation={rotation} />
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
