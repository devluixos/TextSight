<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { EventRef } from 'obsidian';
    import { fetchKeywordsByDocumentId, updateKeyword, deleteKeyword, addKeyword } from '../../../../sqlite/sqlHandler';
    import { get, writable } from 'svelte/store';
    import Toast from '../Toast.svelte';
  
    let documentId: string = '';
    let activeLeaf: any;
    let keywords = writable<any[]>([]);
    let sortedKeywords = writable<any[]>([]);
    let sortColumn = writable<string | null>(null);
    let sortDirection = writable<'asc' | 'desc'>('asc');
    let saveIndicator = writable(false); // Indicator for save feedback
    let newKeyword = writable({ keyword: '', weight: 0 });
    let message = writable<string>('');
  
    async function updateActiveLeaf() {
      activeLeaf = app.workspace.activeLeaf;
      if (activeLeaf && activeLeaf.view && activeLeaf.view.file && activeLeaf.view.file.extension === 'md') {
        documentId = activeLeaf.view.file.path;
        await loadKeywords();
      }
    }
  
    async function loadKeywords() {
      const data = await fetchKeywordsByDocumentId(documentId);
      keywords.set(data);
      sortedKeywords.set(data);
    }
  
    let unsubscribeActiveLeafChange: EventRef;
  
    onMount(() => {
      updateActiveLeaf();
      unsubscribeActiveLeafChange = app.workspace.on('active-leaf-change', updateActiveLeaf);
    });
  
    onDestroy(() => {
      app.workspace.off('active-leaf-change', unsubscribeActiveLeafChange as (...data: any) => any);
    });
  
    function sortTable(column: string) {
      sortDirection.update(direction => direction === 'asc' ? 'desc' : 'asc');
      sortedKeywords.update(data => {
        const sorted = [...data].sort((a, b) => {
          if (a[column] < b[column]) return get(sortDirection) === 'asc' ? -1 : 1;
          if (a[column] > b[column]) return get(sortDirection) === 'asc' ? 1 : -1;
          return 0;
        });
        return sorted;
      });
    }
  
    async function handleAddKeyword() {
      const keyword = get(newKeyword);
      if (keyword.weight < 0 || keyword.weight > 1) {
        message.set('Weight must be between 0 and 1');
        return;
      }
      try {
        await addKeyword(documentId, keyword);
        await loadKeywords();
        newKeyword.set({ keyword: '', weight: 0 });
        indicateSave();
        message.set('Keyword added successfully');
      } catch (error) {
        message.set('Error adding keyword');
      }
    }
  
    async function handleUpdateKeyword(updatedKeyword: any, inputElement: HTMLInputElement) {
      if (updatedKeyword.weight < 0 || updatedKeyword.weight > 1) {
        message.set('Weight must be between 0 and 1');
        return;
      }
      try {
        await updateKeyword(documentId, updatedKeyword);
        await loadKeywords();
        indicateInputSave(inputElement);
        message.set('Keyword updated successfully');
      } catch (error) {
        message.set('Error updating keyword');
      }
    }
  
    async function handleDeleteKeyword(id: number) {
      try {
        await deleteKeyword(documentId, id);
        await loadKeywords();
        message.set('Keyword deleted successfully');
      } catch (error) {
        message.set('Error deleting keyword');
      }
    }
  
    function indicateSave() {
      saveIndicator.set(true);
      setTimeout(() => {
        saveIndicator.set(false);
      }, 2000);
    }
  
    function indicateInputSave(inputElement: HTMLInputElement) {
      inputElement.classList.add('input-updated');
      setTimeout(() => {
        inputElement.classList.remove('input-updated');
      }, 2000);
    }
  </script>
  
  <div>
    <h3 class:save-indicator={$saveIndicator}>Keywords for {documentId}</h3>
    <table class="keywords-table">
      <thead>
        <tr>
          <th on:click={() => sortTable('keyword')}>Keyword</th>
          <th on:click={() => sortTable('weight')}>Weight</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $sortedKeywords as keyword, i}
          <tr>
            <td><input type="text" bind:value={keyword.keyword} on:change={(e) => handleUpdateKeyword(keyword, e.currentTarget)} /></td>
            <td><input type="number" bind:value={keyword.weight} min="0" max="1" step="0.01" on:change={(e) => handleUpdateKeyword(keyword, e.currentTarget)} /></td>
            <td><button on:click={() => handleDeleteKeyword(keyword.id)}>Delete</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
  
    <div class="add-keyword-container">
      <label>
        Keyword:
        <input type="text" placeholder="Keyword" bind:value={$newKeyword.keyword} />
      </label>
      <label>
        Weight:
        <input type="number" placeholder="Weight" bind:value={$newKeyword.weight} min="0" max="1" step="0.01" />
      </label>
      <button on:click={handleAddKeyword}>Add Keyword</button>
    </div>
  
    <Toast {message} />
  </div>
  
  <style lang="scss">
    @import './KeywordList.scss';
  </style>
  