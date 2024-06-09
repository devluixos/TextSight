<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { EventRef } from 'obsidian';
    import { fetchTopicsByDocumentId, updateTopic, deleteTopic, addTopic } from '../../../../sqlite/sqlHandler';
    import { get, writable } from 'svelte/store';
    import Toast from '../Toast.svelte';
  
    let documentId: string = '';
    let activeLeaf: any;
    let topics = writable<any[]>([]);
    let sortedTopics = writable<any[]>([]);
    let sortColumn = writable<string | null>(null);
    let sortDirection = writable<'asc' | 'desc'>('asc');
    let saveIndicator = writable(false); // Indicator for save feedback
    let newTopic = writable({ name: '', weight: 0 });
    let message = writable<string>('');
  
    async function updateActiveLeaf() {
      activeLeaf = app.workspace.activeLeaf;
      if (activeLeaf && activeLeaf.view && activeLeaf.view.file && activeLeaf.view.file.extension === 'md') {
        documentId = activeLeaf.view.file.path;
        await loadTopics();
      }
    }
  
    async function loadTopics() {
      const data = await fetchTopicsByDocumentId(documentId);
      topics.set(data);
      sortedTopics.set(data);
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
      sortedTopics.update(data => {
        const sorted = [...data].sort((a, b) => {
          if (a[column] < b[column]) return get(sortDirection) === 'asc' ? -1 : 1;
          if (a[column] > b[column]) return get(sortDirection) === 'asc' ? 1 : -1;
          return 0;
        });
        return sorted;
      });
    }
  
    async function handleAddTopic() {
      const topic = get(newTopic);
      if (topic.weight < 0 || topic.weight > 1) {
        message.set('Weight must be between 0 and 1');
        return;
      }
      try {
        await addTopic(documentId, topic);
        await loadTopics();
        newTopic.set({ name: '', weight: 0 });
        indicateSave();
        message.set('Topic added successfully');
      } catch (error) {
        message.set('Error adding topic');
      }
    }
  
    async function handleUpdateTopic(updatedTopic: any, inputElement: HTMLInputElement) {
      if (updatedTopic.weight < 0 || updatedTopic.weight > 1) {
        message.set('Weight must be between 0 and 1');
        return;
      }
      try {
        await updateTopic(documentId, updatedTopic);
        await loadTopics();
        indicateInputSave(inputElement);
        message.set('Topic updated successfully');
      } catch (error) {
        message.set('Error updating topic');
      }
    }
  
    async function handleDeleteTopic(id: number) {
      try {
        await deleteTopic(documentId, id);
        await loadTopics();
        message.set('Topic deleted successfully');
      } catch (error) {
        message.set('Error deleting topic');
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
    <h3 class:save-indicator={$saveIndicator}>Topics for {documentId}</h3>
    <table class="topics-table">
      <thead>
        <tr>
          <th on:click={() => sortTable('name')}>Name</th>
          <th on:click={() => sortTable('weight')}>Weight</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $sortedTopics as topic, i}
          <tr>
            <td><input type="text" bind:value={topic.name} on:change={(e) => handleUpdateTopic(topic, e.currentTarget)} /></td>
            <td><input type="number" bind:value={topic.weight} min="0" max="1" step="0.01" on:change={(e) => handleUpdateTopic(topic, e.currentTarget)} /></td>
            <td><button on:click={() => handleDeleteTopic(topic.id)}>Delete</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
  
    <div class="add-topic-container">
      <label>
        Name:
        <input type="text" placeholder="Name" bind:value={$newTopic.name} />
      </label>
      <label>
        Weight:
        <input type="number" placeholder="Weight" bind:value={$newTopic.weight} min="0" max="1" step="0.01" />
      </label>
      <button on:click={handleAddTopic}>Add Topic</button>
    </div>
  
    <Toast {message} />
  </div>
  
  <style lang="scss">
    @import './TopicList.scss';
  </style>
  