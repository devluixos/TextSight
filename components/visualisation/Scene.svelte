<script lang="ts">
    import { onMount } from 'svelte';
    import { Canvas, T } from '@threlte/core';
    import { OrbitControls } from '@threlte/extras';
    import { improvedClusteredLayout } from './DocumentDataProcessor';
    import { interactivity } from '@threlte/extras';
    import { DocumentDetail } from 'model';
    import { fetchDetailedDocumentData } from 'sqlite/sqlHandler';
  
    let documents: DocumentDetail[] = [];
    let connections: { start: [number, number, number], end: [number, number, number] }[] = [];
  
    async function initializeVisualization() {
      documents = [];
      connections = [];
      await fetchAndProcessData();
    }
  
    async function fetchAndProcessData() {
      documents = await fetchDetailedDocumentData();
      documents = improvedClusteredLayout(documents);
      documents.forEach(doc => {
        doc.connections.forEach(conn => {
          if (conn.connectedDocumentId) {
            const targetDoc = documents.find(d => d.documentId === conn.connectedDocumentId);
            if (targetDoc && targetDoc.position) {
              connections.push({
                start: convertPosition(doc.position),
                end: convertPosition(targetDoc.position)
              });
            }
          }
        });
      });
    }
  
    function convertPosition(position?: { x: number, y: number, z: number }): [number, number, number] {
      if (!position) return [0, 0, 0];
      return [position.x, position.y, position.z];
    }
  
    function handleDocumentClick(document: DocumentDetail) {
      console.log("Document clicked:", document);
    }
  
    onMount(() => {
      initializeVisualization();
    });
  </script>
  
  <style>
    .reload-button {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
      padding: 5px 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
  
  <button class="reload-button" on:click={initializeVisualization}>Reload Visualization</button>
  
  <Canvas>
    {interactivity()}
    <T.PerspectiveCamera makeDefault position={[10, 10, 10]} on:create={({ ref }) => ref.lookAt(0, 0, 0)}>
      <OrbitControls />
    </T.PerspectiveCamera>
    <T.AmbientLight intensity={0.3} />
    <T.DirectionalLight position={[3, 10, 7]} intensity={1} />
  
    {#each documents as document}
      <T.Mesh position={convertPosition(document.position)} on:click={() => handleDocumentClick(document)}>
        <T.BoxGeometry args={[1, 1, 1]} />
        <T.MeshStandardMaterial color='#ffcc00' />
      </T.Mesh>
    {/each}
  
    {#each connections as connection}
      <T.Line points={[connection.start, connection.end]}>
        <T.LineBasicMaterial color='#ff0000' linewidth={2} />
      </T.Line>
    {/each}
  
    <T.GridHelper args={[50, 50, 1, '#FE3D00', '#FE3D00']} />
  </Canvas>
  