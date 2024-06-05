<script lang="ts">
  import { onMount } from 'svelte';
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls, interactivity, Sky, Stars, ContactShadows, Environment } from '@threlte/extras';
  import { DocumentDetail } from 'model';
  import { runLayout } from './Calculations/calculatePositions';
  import { fetchDetailedDocumentData } from 'sqlite/sqlHandler';
  import DocumentScene from './DocumentScene.svelte';
  import skybox from '../assets/skyboxes/skybox.glb';

  let documents: DocumentDetail[] = [];
  let nodePositions: { [key: string]: { x: number, y: number, z: number } } = {};

  const skyboxSettings = {
    turbidity: 10,
    rayleigh: 3,
    azimuth: 180,
    elevation: 0.5,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    exposure: 0.7
  };

  async function initializeVisualization() {
    documents = await fetchDetailedDocumentData();
    nodePositions = runLayout(documents, 100, 0.01);
    console.log("Node Positions:", nodePositions);
  }

  onMount(() => {
    initializeVisualization();
  });
</script>

<Canvas>
    {interactivity()}
    <T.PerspectiveCamera
      makeDefault
      position={[10, 10, 10]}
      on:create={({ ref }) => ref.lookAt(0, 0, 0)}
    >
      <OrbitControls />
    </T.PerspectiveCamera>
    <T.AmbientLight intensity={0.2} />
    <T.DirectionalLight
      position={[10, 20, 10]}
      intensity={1.3}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
    />
    <ContactShadows
      scale={50}
      blur={0.5}
      far={10}
      opacity={0.6}
      position={[0, -0.05, 0]} 
    />

    <Environment files={skybox} />

    <Stars />

    <Sky
      setEnvironment={true}
      turbidity={skyboxSettings.turbidity}
      rayleigh={skyboxSettings.rayleigh}
      azimuth={skyboxSettings.azimuth}
      elevation={skyboxSettings.elevation}
      mieCoefficient={skyboxSettings.mieCoefficient}
      mieDirectionalG={skyboxSettings.mieDirectionalG}
    />

    <DocumentScene {documents} {nodePositions} />
</Canvas>

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
