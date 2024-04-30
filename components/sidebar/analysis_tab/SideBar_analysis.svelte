<!-- AnalysisTab.svelte -->

<script lang="ts">
    import { writable, get } from 'svelte/store';
    import { onMount, onDestroy } from 'svelte';
    import { Jellyfish } from 'svelte-loading-spinners';
  
    import type { EventRef } from 'obsidian';
    import { callGPT4 } from '../../../nlp/nlpService';
    import { logDatabaseContent, saveAnalysisResults, checkIfLeafExistsInDatabase } from '../../../sqlite/sqlHandler';
  
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
          return activeLeaf;
        }
        return current;
      });
    }
  
    async function analyseActiveLeafContentAndCallAPI() {
      let content = get(selectedLeaf).view.containerEl.textContent;
      let leafId = get(selectedLeaf).view.file.path;
  
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
  
    async function checkLeaf(leafIdParam: any) {
      leafExistsInDatabase = await checkIfLeafExistsInDatabase(leafIdParam);
    }
  
    function getRandomLoadingMessage() {
      return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    }
  
    let unsubscribeLayoutChange: EventRef;
    let unsubscribeActiveLeafChange: EventRef;
  
    onMount(() => {
      updateLeaves();
      unsubscribeLayoutChange = this.app.workspace.on('layout-change', updateLeaves);
      unsubscribeActiveLeafChange = this.app.workspace.on('active-leaf-change', updateSelectedLeaf);
    });
  
    onDestroy(() => {
      this.app.workspace.off('layout-change', unsubscribeLayoutChange as (...data: any) => any);
      this.app.workspace.off('active-leaf-change', unsubscribeActiveLeafChange as (...data: any) => any);
    });
  </script>
  
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
  
  <style lang="scss">
    @import './SideBar_analysis.scss';
  </style>
  