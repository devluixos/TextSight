<script lang="ts">
  import { onMount } from 'svelte';
  import { handleAnalyseConnections } from '../../../nlp/nlpService';
  import { dropConnections } from 'sqlite/sqlHandler';
  import Scene from '../../visualisation/Scene.svelte'; // Import your Scene component

  // Define the type for the Scene component
  type SceneComponent = {
    initializeVisualization: () => void;
  };

  let sceneRef: SceneComponent | null = null;

  function reloadVisualization() {
    if (sceneRef) {
      sceneRef.initializeVisualization();
    }
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
</div>
