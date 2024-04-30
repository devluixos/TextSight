<script lang="ts">
	import { onMount } from 'svelte';
    import { handleAnalyseConnections } from '../../../nlp/nlpService';
  
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
    <button on:click={ () => handleAnalyseConnections()}>Analyse Connections</button>
  </div>