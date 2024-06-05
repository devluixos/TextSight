<script lang="ts">
  import { onMount } from 'svelte';
  import { handleAnalyseConnections } from '../../../nlp/nlpService';
  import { dropConnections } from 'sqlite/sqlHandler';



  type SceneComponent = {
    initializeVisualization: () => void;
  };

  let sceneRef: SceneComponent | null = null;



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

<style>
/*
  .slider-container {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    grid-gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }

  .slider-container input {
    width: 100%;
  }

  .value-label {
    text-align: right;
  }
*/
</style>


<div class="content textsight-content">
  <h3>Analyse the connections!</h3>
  <button on:click={() => handleAnalyseConnections()}>Analyse Connections</button>
  <button on:click={() => dropConnections()}>Drop Connections</button>
</div>


  <!--
  <div class="slider-container">
    <label for="width">Width</label>
    <input id="width" type="range" min="50" max="500" step="10" bind:value={$width} on:input={() => reloadVisualization()} />
    <span class="value-label">{$width}</span>
  </div>

  <div class="slider-container">
    <label for="height">Height</label>
    <input id="height" type="range" min="50" max="500" step="10" bind:value={$height} on:input={() => reloadVisualization()} />
    <span class="value-label">{$height}</span>
  </div>

  <div class="slider-container">
    <label for="maxIterations">Max Iterations</label>
    <input id="maxIterations" type="range" min="100" max="5000" step="100" bind:value={$maxIterations} on:input={() => reloadVisualization()} />
    <span class="value-label">{$maxIterations}</span>
  </div>

  <div class="slider-container">
    <label for="scale">Scale</label>
    <input id="scale" type="range" min="0.01" max="1" step="0.01" bind:value={$scale} on:input={() => reloadVisualization()} />
    <span class="value-label">{$scale}</span>
  </div>

  <div class="slider-container">
    <label for="connectionStrength">Connection Strength</label>
    <input id="connectionStrength" type="range" min="0.01" max="1" step="0.01" bind:value={$connectionStrength} on:input={() => reloadVisualization()} />
    <span class="value-label">{$connectionStrength}</span>
  </div>

  <div class="slider-container">
    <label for="repulsionStrength">Repulsion Strength</label>
    <input id="repulsionStrength" type="range" min="0.01" max="1" step="0.01" bind:value={$repulsionStrength} on:input={() => reloadVisualization()} />
    <span class="value-label">{$repulsionStrength}</span>
  </div>

  <div class="slider-container">
    <label for="clusterRepulsionStrength">Cluster Repulsion Strength</label>
    <input id="clusterRepulsionStrength" type="range" min="0.01" max="1" step="0.01" bind:value={$clusterRepulsionStrength} on:input={() => reloadVisualization()} />
    <span class="value-label">{$clusterRepulsionStrength}</span>
  </div>

  <div class="slider-container">
    <label for="centralAttractionStrength">Central Attraction Strength</label>
    <input id="centralAttractionStrength" type="range" min="0.01" max="1" step="0.01" bind:value={$centralAttractionStrength} on:input={() => reloadVisualization()} />
    <span class="value-label">{$centralAttractionStrength}</span>
  </div>

  <div class="slider-container">
    <label for="minDistance">Min Distance</label>
    <input id="minDistance" type="range" min="1" max="50" step="1" bind:value={$minDistance} on:input={() => reloadVisualization()} />
    <span class="value-label">{$minDistance}</span>
  </div>
</div>
-->