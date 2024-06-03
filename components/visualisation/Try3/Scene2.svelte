<script lang="ts">
  import { onMount } from 'svelte';
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls, interactivity, Sky, Stars, CSM } from '@threlte/extras';
  import { DocumentDetail } from 'model';
  import { runLayout } from './calculatePositions';
  import { fetchDetailedDocumentData } from 'sqlite/sqlHandler';
  import { Vector3 } from 'three';
  import DocumentScene from './DocumentScene.svelte';

  let documents: DocumentDetail[] = [];
  let nodePositions: { [key: string]: { x: number, y: number, z: number } } = {};

  const skyboxSettings = {
    turbidity: 10,
    rayleigh: 3,
    azimuth: 180,
    elevation: 0.5,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7
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
  <CSM
    enabled
    args={{
      lightDirection: new Vector3(1, -1, 1).normalize()
    }}
  >
    {interactivity()}
    <T.PerspectiveCamera
      makeDefault
      position={[10, 10, 10]}
      on:create={({ ref }) => ref.lookAt(0, 0, 0)}
    >
      <OrbitControls />
    </T.PerspectiveCamera>
    <T.AmbientLight intensity={0.3} />
    <T.DirectionalLight position={[3, 10, 7]} intensity={0.1} />
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

  </CSM>
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
