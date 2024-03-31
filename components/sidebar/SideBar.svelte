<script lang="ts">
  import { writable, derived } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';
  import type { EventRef, WorkspaceLeaf } from 'obsidian';
  import { callGPT4 } from '../../nlp/nlpService';
	import { logDatabaseContent, saveAnalysisResults } from '../../sqlite/sqlHandler';

  let activeTab = 'Home';
  let openLeaves: WorkspaceLeaf[] = [];
  let selectedLeafId = writable<WorkspaceLeaf | null>(null);

  let selectedLeaf = derived(selectedLeafId, ($selectedLeafId) => {
    return openLeaves.find(leaf => leaf === $selectedLeafId) || null;
  });

  function updateLeaves() {
    openLeaves = this.app.workspace.getLeavesOfType('markdown');
  }

  function updateSelectedLeaf() {
    const activeLeaf = this.app.workspace.activeLeaf;
    selectedLeafId.update(current => {
      // Only update if the active leaf has actually changed
      if (activeLeaf && openLeaves.includes(activeLeaf) && current !== activeLeaf) {
        return activeLeaf;
      }
      return current;
    });
  }

  async function analyseActiveLeafContentAndCallAPI() {
    const activeLeaf = this.app.workspace.activeLeaf;
    if (!activeLeaf) {
      console.error("No active leaf found.");
      return;
    }

    let content = '';
    let leafId = activeLeaf.id;
    console.log('leaf id', leafId);
    selectedLeaf.subscribe((leaf) => {
      if (leaf) {
        content = leaf.view.containerEl.textContent ?? '';
      }
    });
    
    if (content && leafId) {
      try {
        console.log("Calling API with content:", content);
        const apiResponse = await callGPT4(content);
        console.log("API response:", apiResponse);
        saveAnalysisResults(leafId, apiResponse);
        // Here, you can call your database function and pass `leafId` along with `apiResponse`
      } catch (error) {
        console.error("Failed to analyze text:", error);
      }
    } else {
      console.log("The active leaf does not contain any content to analyze or leaf ID is missing.");
    }
  }

  function getLeafIdentifier() {
    console.log('leaf id', selectedLeafId);
    console.log('leaf', selectedLeaf.subscribe((leaf) => {
      console.log('leaf', leaf);
    }));
  }


  // Define variables for unsubscription outside of onMount to ensure they are in the correct scope
  let unsubscribeLayoutChange: EventRef;
  let unsubscribeActiveLeafChange: EventRef;

  onMount(() => {
    updateLeaves();
    // Subscribe to layout changes
    unsubscribeLayoutChange = this.app.workspace.on('layout-change', updateLeaves);
    // Subscribe to active leaf changes
    unsubscribeActiveLeafChange = this.app.workspace.on('active-leaf-change', updateSelectedLeaf);
  });

  onDestroy(() => {
    // Use app.workspace.off with the specific event references to unsubscribe
    this.app.workspace.off('layout-change', unsubscribeLayoutChange as (...data: any) => any);
    this.app.workspace.off('active-leaf-change', unsubscribeActiveLeafChange as (...data: any) => any);
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
    <button on:click={() => analyseActiveLeafContentAndCallAPI()}>Analyze Text</button>
    <label for="leaf-select">Select a leaf:</label>
    <select id="leaf-select" bind:value={$selectedLeafId}>
      {#each openLeaves as leaf (leaf)}
        <option value={leaf}>{leaf.getDisplayText()}</option>
      {/each}
    </select>
    <button on:click={ () => logDatabaseContent()}>DataBase</button>
  </div>
{:else if activeTab === 'Merchandise'}
  <div class="content merchandise-content">Content 2</div>
{/if}

<style lang="scss">
  @import './SideBar.scss';
</style>
