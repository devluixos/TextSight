<script lang="ts">
  import { writable, derived } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';
  import type { EventRef, WorkspaceLeaf } from 'obsidian';
  import { callGPT4 } from '../../nlp/nlpService';

  let activeTab = 'Home';
  let openLeaves: WorkspaceLeaf[] = [];
  let selectedLeafId = writable<WorkspaceLeaf | null>(null);

  let selectedLeaf = derived(selectedLeafId, ($selectedLeafId) => {
    return openLeaves.find(leaf => leaf === $selectedLeafId) || null;
  });

  function updateLeaves() {
    openLeaves = app.workspace.getLeavesOfType('markdown');
  }

  function updateSelectedLeaf() {
    const activeLeaf = app.workspace.activeLeaf;
    selectedLeafId.update(current => {
      // Only update if the active leaf has actually changed
      if (activeLeaf && openLeaves.includes(activeLeaf) && current !== activeLeaf) {
        return activeLeaf;
      }
      return current;
    });
  }


  let apiResponse;
  async function analyzeText(text: string) {
    try {
      const content = await callGPT4(text);
      apiResponse = content || '{}';
      console.log('apiResponse: \n', apiResponse);
    } catch (error) {
      console.error(error);
    }
  }

  // Define variables for unsubscription outside of onMount to ensure they are in the correct scope
  let unsubscribeLayoutChange: EventRef;
  let unsubscribeActiveLeafChange: EventRef;

  onMount(() => {
    updateLeaves();
    // Subscribe to layout changes
    unsubscribeLayoutChange = app.workspace.on('layout-change', updateLeaves);
    // Subscribe to active leaf changes
    unsubscribeActiveLeafChange = app.workspace.on('active-leaf-change', updateSelectedLeaf);
  });

  onDestroy(() => {
    // Use app.workspace.off with the specific event references to unsubscribe
    app.workspace.off('layout-change', unsubscribeLayoutChange as (...data: any) => any);
    app.workspace.off('active-leaf-change', unsubscribeActiveLeafChange as (...data: any) => any);
  });
</script>


<!-- UI for switching tabs and displaying content based on the active tab -->
<div class="tabs-container">
  <button class="tab" on:click={() => (activeTab = 'Home')}>Home</button>
  <button class="tab" on:click={() => (activeTab = 'Merchandise')}>Merchandise</button>
</div>

{#if activeTab === 'Home'}
  <div class="content home-content">
    Content 1
    <button on:click={() => analyzeText("test")}>Analyze Text</button>
    <label for="leaf-select">Select a leaf:</label>
    <select id="leaf-select" bind:value={$selectedLeafId}>
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
