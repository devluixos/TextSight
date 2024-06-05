<script lang="ts">
	import { FileSystemAdapter } from 'obsidian';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  const fs = require('fs');
  const path = require('path');
  const { Notice } = require('obsidian');

  export let showModal: boolean;
  let apiKey = writable('');
  let adapter: any;
  let envPath = '';

  onMount(() => {
    adapter = app.vault.adapter;
    if (adapter instanceof FileSystemAdapter) {
      envPath = path.join(adapter.getBasePath(), './.obsidian/plugins/TextSight/.env');
    }
  });

  function saveApiKey() {
    apiKey.update(key => {
      if (fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, `OPENAI_API_KEY=${key}`);
        new Notice('API Key saved successfully.');
      } else {
        new Notice('Error: .env file not found.');
      }
      showModal = false;
      return key;
    });
  }
</script>

<div class="modal-background" on:click="{() => showModal = false}"></div>
<div class="modal">
  <div class="modal-header">
    <h2>API Settings</h2>
    <button on:click="{() => showModal = false}">X</button>
  </div>
  <div class="modal-content">
    <label for="api-key">API Key</label>
    <input id="api-key" type="text" bind:value="{$apiKey}" placeholder="Enter your API Key" />
    <button on:click="{saveApiKey}">Save</button>
  </div>
</div>

<style>
  .modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 1rem;
    border-radius: 8px;
    z-index: 1001;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 80%;
    max-width: 500px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-content {
    margin-top: 1rem;
  }

  @media (max-width: 768px) {
    .modal {
      width: 90%;
      padding: 0.5rem;
    }

    .modal-content {
      margin-top: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .modal {
      width: 95%;
      padding: 0.25rem;
    }

    .modal-content {
      margin-top: 0.25rem;
    }
  }
</style>
