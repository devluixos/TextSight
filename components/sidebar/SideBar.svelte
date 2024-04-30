<script lang="ts">
  import { writable, derived, get } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';
  import { Jellyfish } from 'svelte-loading-spinners';

  import type { EventRef, WorkspaceLeaf } from 'obsidian';
  import { callGPT4, constructComprehensivePromptForAllDocuments } from '../../nlp/nlpService';
	import { logDatabaseContent, saveAnalysisResults, checkIfLeafExistsInDatabase, fetchAllDocumentData } from '../../sqlite/sqlHandler';
  import { handleAnalyseConnections } from '../../nlp/nlpService';

  import testimage from '../../assets/TextSightIcon_Black.png';

  let activeTab = 'Analysis';
  let openLeaves: any[] = [];
  let selectedLeaf = writable<any | null>(null);
  let currentLeaf: any;
  let leafExistsInDatabase = false;
  let activeLeaf: any;
  let isLoading = false;
  const loadingMessages = [
    "Training the AI...",
    "Building the Zettelkasten...",
    "Analyzing text patterns...",
    "Optimizing the LLM...",
    "Linking notes in Obsidian...",
    "Running the NLP engine...",
    "Generating insights...",
    "Unleashing the power of AI...",
    "Deciphering the Zettelkasten...",
    "Finding connections in Obsidian...",
    "Teaching the AI new words...",
    "Exploring the text landscape...",
    "Cracking the code of language...",
    "Unraveling the mysteries of text...",
    "Diving deep into the Zettelkasten...",
    "Surfing the waves of AI...",
    "Navigating the sea of text...",
    "Journeying through the Obsidian network...",
    "Decoding the language of AI...",
    "Unlocking the secrets of the Zettelkasten..."
  ];
  let loadingMessage = '';
  let loadingMessageInterval: any;



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
    let content = get(selectedLeaf).view.containerEl.textContent;
    let leafId = get(selectedLeaf).view.file.path;
    

    //Check if leaf exists in the database
    await checkLeaf(leafId);
    if(leafExistsInDatabase) {
      return;
    }
    if(!leafExistsInDatabase) {
      loadingMessage = "Hamster starts to run...";
      loadingMessageInterval = setInterval(() => {
        loadingMessage = getRandomLoadingMessage();
      }, 3000);
      isLoading = true;
    }
    
    if (content && leafId) {
      try {
        const apiResponse = await callGPT4(content);
        clearInterval(loadingMessageInterval);
        isLoading = false;
        saveAnalysisResults(leafId, apiResponse);
      } catch (error) {
        clearInterval(loadingMessageInterval);
        isLoading = false;
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

  function getRandomLoadingMessage() {
    return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
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

//----------------------------------------
// TextSight interactions from the sidebar
//----------------------------------------
function onTextSightTabClick() {
  // Check if the TextSight leaf already exists
  let textSightLeaf = this.app.workspace.getLeavesOfType('my-visualisation')[0];

  // If it doesn't exist, create a new leaf
  if (!textSightLeaf) {
    textSightLeaf = this.app.workspace.getLeaf();
    textSightLeaf.setViewState({ type: 'my-visualisation' });
  } else {
    // If it exists, focus on it
    this.app.workspace.setActiveLeaf(textSightLeaf);
  }
}


//----------------------------------------
// Text Sight Tab Functions
//----------------------------------------

</script>


<!---------------------------------------------------------------------------
UI for switching tabs and displaying content based on the active tab 
---------------------------------------------------------------------------->
<div class="header">
  <h1>Text Analysis</h1>
</div>

<div class="tabs-container">
  <button class={activeTab === 'Analysis' ? 'tab active' : 'tab'} on:click={() => (activeTab = 'Analysis')}>Analysis</button>
  <button class={activeTab === 'TextSight' ? 'tab active' : 'tab'} 
  on:click={() => {
    activeTab = 'TextSight';
    onTextSightTabClick();
    }}>TextSight</button>
</div>

{#if activeTab === 'Analysis'}
  <div class="content analysis-content">
    <div class="controls">
      <label for="leaf-select">Select a leaf:</label>
      <select id="leaf-select" bind:value={$selectedLeaf} on:change={handleLeafSelection}>
        {#each openLeaves as leaf (leaf)}
          <option value={leaf}>{leaf.getDisplayText()}</option>
        {/each}
      </select>
      <button on:click={() => analyseActiveLeafContentAndCallAPI()}>Analyze Text</button>
    </div>
    {#if isLoading}
      <div class="loading-spinner">
        <Jellyfish size="60" color="blue" />
        <br />
        <p>{loadingMessage}</p>
      </div>
    {/if}
    {#if leafExistsInDatabase}
      <p class="p-error">The leaf already exists in the database.</p>
    {/if}
    <div class="database">
      <button on:click={ () => logDatabaseContent()}>DataBase</button>
    </div>
  </div>
{:else if activeTab === 'TextSight'}
  <div class="content textsight-content">
    <h3>Analyse the connections!</h3>
    <button on:click={ () => handleAnalyseConnections()}>Analyse Connections</button>
  </div>
{/if}

<style lang="scss">
  @import './SideBar.scss';
</style>
