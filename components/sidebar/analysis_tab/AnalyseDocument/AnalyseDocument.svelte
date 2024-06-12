<script lang="ts">
  import { writable, get } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';
  import { Jellyfish } from 'svelte-loading-spinners';
  import { callGPT4 } from '../../../../nlp/nlpService';
  import { checkIfLeafExistsInDatabase, saveAnalysisResults, logDatabaseContent } from '../../../../sqlite/sqlHandler';
  import type { EventRef } from 'obsidian';
  import SettingsModal from '../SettingsModal.svelte';
  import Toast from '../Toast.svelte';

  let openLeaves = writable<any[]>([]);
  let selectedLeaf = writable<any | null>(null);
  let currentLeaf: any;
  let leafExistsInDatabase = false;
  let activeLeaf: any;
  let isLoading = writable(false);
  let loadingMessage = writable('');
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
  let loadingMessageInterval: any;
  let showModal = writable(false);
  let toastMessage = writable('');

  function handleLeafSelection() { 
    currentLeaf = get(selectedLeaf);
  }  

  function updateLeaves() {
    openLeaves.set(app.workspace.getLeavesOfType('markdown'));
  }

  function updateSelectedLeaf() {
    activeLeaf = app.workspace.activeLeaf;
    selectedLeaf.update(current => {
      if (activeLeaf && get(openLeaves).includes(activeLeaf) && current !== activeLeaf) {
        return activeLeaf;
      }
      return current;
    });
  }

  async function analyseActiveLeafContentAndCallAPI() {
    let content = get(selectedLeaf).view.containerEl.textContent;
    let leafId = get(selectedLeaf).view.file.path;

    await checkLeaf(leafId);
    if (leafExistsInDatabase) {
      toastMessage.set('The leaf already exists in the database.');
      return;
    }
    if (!leafExistsInDatabase) {
      loadingMessage.set("Hamster starts to run...");
      loadingMessageInterval = setInterval(() => {
        loadingMessage.set(getRandomLoadingMessage());
      }, 3000);
      isLoading.set(true);
    }
    
    if (content && leafId) {
      try {
        const apiResponse = await callGPT4(content);
        clearInterval(loadingMessageInterval);
        isLoading.set(false);
        saveAnalysisResults(leafId, apiResponse);
        toastMessage.set('Analysis complete.');
      } catch (error) {
        clearInterval(loadingMessageInterval);
        isLoading.set(false);
        console.error("Failed to analyze text:", error);
        toastMessage.set('Analysis error.');
      }
    } else {
      console.log("The active leaf does not contain any content to analyze or leaf ID is missing.");
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
    unsubscribeLayoutChange = app.workspace.on('layout-change', updateLeaves);
    unsubscribeActiveLeafChange = app.workspace.on('active-leaf-change', updateSelectedLeaf);
  });

  onDestroy(() => {
    app.workspace.off('layout-change', unsubscribeLayoutChange as (...data: any) => any);
    app.workspace.off('active-leaf-change', unsubscribeActiveLeafChange as (...data: any) => any);
  });
</script>

<div class="container">
  <h2>Analyze the Selected Document</h2>
  <div class="controls">
      <label for="leaf-select">Select a leaf:</label>
      <select id="leaf-select" bind:value={$selectedLeaf} on:change={handleLeafSelection}>
          {#each $openLeaves as leaf (leaf)}
              <option value={leaf}>{leaf.getDisplayText()}</option>
          {/each}
      </select>
      <button on:click={() => analyseActiveLeafContentAndCallAPI()}>Analyze Text</button>
  </div>
  
  {#if $isLoading}
      <div class="loading-container">
          <div class="loading-spinner">
              <Jellyfish size="60" color="blue" />
          </div>
          <p class="loading-text">{$loadingMessage}</p>
      </div>
  {/if}

  {#if leafExistsInDatabase}
      <p class="p-error">The leaf already exists in the database.</p>
  {/if}

  <div class="database">
      <button on:click={ () => logDatabaseContent()}>DataBase</button>
  </div>

  <div class="api-key">
      <button on:click={() => showModal.set(true)}>Set API Key</button>
  </div>

  {#if $showModal}
      <SettingsModal bind:showModal={$showModal} />
  {/if}

  <Toast bind:message={toastMessage} />
</div>

<style lang="scss">
  @import './AnalyseDocument.scss';
</style>
