<script lang="ts">
  import { writable, get } from 'svelte/store';
  import { onMount } from 'svelte';
  import { handleAnalyseConnections } from '../../../nlp/nlpService';
  import { Jellyfish } from 'svelte-loading-spinners';
  import Modal from './Modal/Modal.svelte';
  import Toast from '../analysis_tab/Toast.svelte';
  import { dropConnections, fetchDetailedDocumentData } from '../../../sqlite/sqlHandler';
  import FilterOptions from './Filters/FilterOptions.svelte';
  import type { DocumentDetail } from '../../../model';

  let textSearch = writable('');
  let selectedEntities = writable([]);
  let selectedKeywords = writable([]);
  let selectedTopics = writable([]);
  let dateRange = writable({ start: '', end: '' });

  let isLoadingConnections = writable(false);
  let loadingMessage = writable('');
  let showModal = writable(false);
  let toastMessage = writable('');
  let documents = writable<DocumentDetail[]>([]);
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

  function getRandomLoadingMessage() {
    return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  }

  async function handleAnalyseConnectionsWithLoading() {
    loadingMessage.set("Hamster starts to run...");
    loadingMessageInterval = setInterval(() => {
      loadingMessage.set(getRandomLoadingMessage());
    }, 3000);
    isLoadingConnections.set(true);

    try {
      await handleAnalyseConnections();
    } catch (error) {
      console.error("Failed to analyze connections:", error);
    } finally {
      clearInterval(loadingMessageInterval);
      isLoadingConnections.set(false);
    }
  }

  async function applyFilters() {
    const filters = {
      textSearch: get(textSearch),
      entities: get(selectedEntities),
      keywords: get(selectedKeywords),
      topics: get(selectedTopics),
      dateRange: get(dateRange)
    };
    documents.set(await fetchDetailedDocumentData(filters));
    toastMessage.set('Filters applied.');
  }

  function confirmDropConnections() {
    showModal.set(true);
  }

  async function executeDropConnections() {
    await dropConnections();
    showModal.set(false);
    toastMessage.set("Connections dropped successfully!");
  }

  function handleCloseModal() {
    showModal.set(false);
    toastMessage.set("Action cancelled.");
  }

  onMount(() => {
    let textSightLeaf = this.app.workspace.getLeavesOfType('my-visualisation')[0];
    if (!textSightLeaf) {
      textSightLeaf = this.app.workspace.getLeaf();
      textSightLeaf.setViewState({ type: 'my-visualisation' });
    } else {
      this.app.workspace.setActiveLeaf(textSightLeaf);
    }
  });
</script>

<div class="content textsight-content">
  <h3>Analyse the connections!</h3>
  <button on:click={() => handleAnalyseConnectionsWithLoading()}>Analyse Connections</button>
  <button on:click={confirmDropConnections}>Drop Connections</button>

  {#if $isLoadingConnections}
    <div class="loading-spinner">
      <Jellyfish size="60" color="blue" />
      <br />
      <p>{$loadingMessage}</p>
    </div>
  {/if}

  {#if $showModal}
    <Modal bind:show={$showModal} confirm={executeDropConnections} title="Confirm Action">
      <p>Are you sure you want to drop all connections?</p>
      <button on:click={executeDropConnections}>Yes</button>
      <button on:click={handleCloseModal}>No</button>
    </Modal>
  {/if}

  <div class="sidebar-content">
    <h3>Filters</h3>
    <FilterOptions 
      bind:textSearch={textSearch} 
      bind:selectedEntities={selectedEntities} 
      bind:selectedKeywords={selectedKeywords} 
      bind:selectedTopics={selectedTopics} 
      bind:dateRange={dateRange} 
    />
  </div>
  

  <Toast bind:message={toastMessage} />
</div>

<style lang="scss">
  @import './SideBar_textsight.scss';
</style>
