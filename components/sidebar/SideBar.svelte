<script lang="ts">
  import { writable, derived, get } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';
  import type { EventRef, WorkspaceLeaf } from 'obsidian';
  import { callGPT4 } from '../../nlp/nlpService';
	import { logDatabaseContent, saveAnalysisResults, checkIfLeafExistsInDatabase } from '../../sqlite/sqlHandler';

  let activeTab = 'Analysis';
  let openLeaves: any[] = [];
  let selectedLeaf = writable<any | null>(null);
  let currentLeaf: any;
  let leafExistsInDatabase = false;
  let activeLeaf: any;



//-----------------------------------------------------------------------------------------------
// Store to keep track of the selected leaf based on the selected leaf ID for Dropdown selection
//-----------------------------------------------------------------------------------------------
  function handleLeafSelection() { 
    currentLeaf = get(selectedLeaf);
  }  

  function updateLeaves() {
    openLeaves = this.app.workspace.getLeavesOfType('markdown');
  }

  function updateSelectedLeaf() {
    activeLeaf = this.app.workspace.activeLeaf;
    selectedLeaf.update(current => {
      if (activeLeaf && openLeaves.includes(activeLeaf) && current !== activeLeaf) {
        console.log('Active leaf:', activeLeaf);
        console.log('activeLeaf.id:', activeLeaf.id);
        return activeLeaf;
      }
      return current;
    });
  }


//--------------------------------------------------------------------
// Function to call the API and analyze the content of the active leaf
//--------------------------------------------------------------------
  async function analyseActiveLeafContentAndCallAPI() {
    console.log(get(selectedLeaf));
    let content = get(selectedLeaf).view.containerEl.textContent;
    let leafId = get(selectedLeaf).id;
    console.log('Leaf ID:', leafId);
    console.log('Content:', content);

    //Check if leaf exists in the database
    await checkLeaf(leafId);
    if(leafExistsInDatabase) {
      console.log('Leaf already exists in the database: exists:', leafExistsInDatabase);
      return;
    }

    if (content && leafId) {
      try {
        console.log("Calling API with content:", content);
        const apiResponse = await callGPT4(content);
        console.log("API response:", apiResponse);
        saveAnalysisResults(leafId, apiResponse);
      } catch (error) {
        console.error("Failed to analyze text:", error);
      }
    } else {
      console.log("The active leaf does not contain any content to analyze or leaf ID is missing. or it already exists in the DB");
    }
  }

  //Check if ID exists
  async function checkLeaf(leafIdParam: any) {
    leafExistsInDatabase = await checkIfLeafExistsInDatabase(leafIdParam);
  }

//-----------------------------------------------------------------------------------------------
// Define variables for unsubscription outside of onMount to ensure they are in the correct scope
//-----------------------------------------------------------------------------------------------
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


<!---------------------------------------------------------------------------
UI for switching tabs and displaying content based on the active tab 
---------------------------------------------------------------------------->
<div class="tabs-container">
  <button class="tab" on:click={() => (activeTab = 'Analysis')}>Analysis</button>
  <button class="tab" on:click={() => (activeTab = 'TextSight')}>TextSight</button>
</div>

{#if activeTab === 'Analysis'}
  <div class="content analysis-content">
    Content 1
    <button on:click={() => analyseActiveLeafContentAndCallAPI()}>Analyze Text</button>
    <label for="leaf-select">Select a leaf:</label>
    <select id="leaf-select" bind:value={$selectedLeaf} on:change={handleLeafSelection}>
      {#each openLeaves as leaf (leaf)}
        <option value={leaf}>{leaf.getDisplayText()}</option>
      {/each}
    </select>
    {#if leafExistsInDatabase}
      <p class="p-error">The leaf already exists in the database.</p>
    {:else}
      <p>The leaf does not exist in the database.</p>
    {/if}
    <br />
    <button on:click={ () => logDatabaseContent()}>DataBase</button>
  </div>
{:else if activeTab === 'TextSight'}
  <div class="content textsight-content">Content 2</div>
{/if}

<style lang="scss">
  @import './SideBar.scss';
</style>