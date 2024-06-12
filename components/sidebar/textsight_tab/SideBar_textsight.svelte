<script lang="ts">
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import { handleAnalyseConnections } from '../../../nlp/nlpService';
  import { Jellyfish } from 'svelte-loading-spinners';
  import Modal from './Modal/Modal.svelte';
  import Toast from '../analysis_tab/Toast.svelte';
	import { dropConnections } from 'sqlite/sqlHandler';

  let isLoadingConnections = writable(false);
  let loadingMessage = writable('');
  let showModal = writable(false);
  let toastMessage = writable('');
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

  <Toast bind:message={toastMessage} />
</div>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  h3 {
    margin-bottom: 20px;
    color: var(--text-normal);
  }

  button {
    padding: 10px 20px;
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    max-width: 200px;
    margin: 10px 0;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: var(--interactive-accent-hover);
  }

  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px;
    background-color: var(--background-primary);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin: 20px;
    width: 100%;
    max-width: 600px;
  }

  .loading-spinner p {
    margin-top: 20px;
    color: var(--text-normal);
    text-align: center;
    font-size: 1.2em;
  }
</style>
