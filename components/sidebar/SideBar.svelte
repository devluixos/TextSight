<script lang="ts">
  import { callGPT4 } from '../../nlp/nlpService';
  import { onMount, onDestroy } from 'svelte';
  import { App, WorkspaceLeaf } from 'obsidian';

  let activeTab = 'Home';
  let openLeaves: WorkspaceLeaf[] = [];

  onMount(() => {
    // Get all the open leaves
    openLeaves = app.workspace.getLeavesOfType('markdown');
    app.workspace.on('layout-change', updateLeaves);

  });

  onDestroy(() => {
    // Unsubscribe from layout-change event when the component is destroyed
    app.workspace.off('layout-change', updateLeaves);
  });

  function updateLeaves() {
    openLeaves = app.workspace.getLeavesOfType('markdown');
    console.log('openLeaves: ', openLeaves);
  }

  let apiResponse
  async function analyzeText(text: string) {
    callGPT4("sampleText")
      .then((content) => {
        apiResponse = content || '{}';
        console.log('apiResponse: \n', apiResponse);
      })
      .catch(console.error);
  }
</script>

<div class="tabs-container">
  <button class="tab" on:click={() => (activeTab = 'Home')}>Home</button>
  <button class="tab" on:click={() => (activeTab = 'Merchandise')}>Merchandise</button>
</div>

{#if activeTab === 'Home'}
  <div class="content home-content">
    Content 1
    <button on:click={() => analyzeText("test")}>Analyze Text</button>
    <label for="leaf-select">Select a leaf:</label>
    <select id="leaf-select">
      {#each openLeaves as leaf (leaf)}
        <option value={leaf}>{leaf.getDisplayText()}</option>
      {/each}
    </select>
  </div>
{:else if activeTab === 'Merchandise'}
  <div class="content merchandise-content">Content 2</div>
{/if}

<style lang="scss">
  @import './SideBar.scss';
</style>
