<script lang="ts">
  import { onMount } from 'svelte';
  import { handleAnalyseConnections } from '../../../nlp/nlpService';
  import { dropConnections } from 'sqlite/sqlHandler';
  import Scene from '../../visualisation/Scene.svelte';
  import { setParameters } from '../../visualisation/DocumentDataProcessor';

  let sceneRef: any = null;
  let width = 50;
  let height = 50;
  let maxIterations = 3000;
  let scale = 0.1;
  let connectionStrength = 0.3;
  let repulsionStrength = 0.1;
  let clusterRepulsionStrength = 0.1;
  let centralAttractionStrength = 5.05;
  let minDistance = 3;

  function reloadVisualization() {
    if (sceneRef) {
      sceneRef.initializeVisualization();
    }
  }

  $: {
    setParameters({
      width,
      height,
      maxIterations,
      scale,
      connectionStrength,
      repulsionStrength,
      clusterRepulsionStrength,
      centralAttractionStrength,
      minDistance
    });
    reloadVisualization();
  }

  function onTextSightTabClick() {
    let textSightLeaf = this.app.workspace.getLeavesOfType('my-visualisation')[0];

    if (!textSightLeaf) {
      textSightLeaf = this.app.workspace.getLeaf();
      textSightLeaf.setViewState({ type: 'my-visualisation' });
    } else {
      this.app.workspace.setActiveLeaf(textSightLeaf);
    }
  }

  onMount(() => {
    onTextSightTabClick();
  });
</script>

<div class="content textsight-content">
  <h3>Analyse the connections!</h3>
  <button on:click={() => handleAnalyseConnections()}>Analyse Connections</button>
  <button on:click={() => dropConnections()}>Drop Connections</button>

  <h3>Visualization Parameters</h3>
  <div>
    <label>Width: {width}</label>
    <input type="range" min="10" max="100" step="1" bind:value={width} />
  </div>
  <div>
    <label>Height: {height}</label>
    <input type="range" min="10" max="100" step="1" bind:value={height} />
  </div>
  <div>
    <label>Max Iterations: {maxIterations}</label>
    <input type="range" min="100" max="5000" step="100" bind:value={maxIterations} />
  </div>
  <div>
    <label>Scale: {scale}</label>
    <input type="range" min="0.01" max="2" step="0.01" bind:value={scale} />
  </div>
  <div>
    <label>Connection Strength: {connectionStrength}</label>
    <input type="range" min="0.1" max="2" step="0.1" bind:value={connectionStrength} />
  </div>
  <div>
    <label>Repulsion Strength: {repulsionStrength}</label>
    <input type="range" min="0.1" max="2" step="0.1" bind:value={repulsionStrength} />
  </div>
  <div>
    <label>Cluster Repulsion Strength: {clusterRepulsionStrength}</label>
    <input type="range" min="0.1" max="2" step="0.1" bind:value={clusterRepulsionStrength} />
  </div>
  <div>
    <label>Central Attraction Strength: {centralAttractionStrength}</label>
    <input type="range" min="0" max="2" step="0.1" bind:value={centralAttractionStrength} />
  </div>
  <div>
    <label>Min Distance: {minDistance}</label>
    <input type="range" min="0" max="2" step="0.1" bind:value={minDistance} />
  </div>
</div>
