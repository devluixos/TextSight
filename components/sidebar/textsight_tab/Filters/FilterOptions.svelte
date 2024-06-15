<script lang="ts">
    import { writable, get } from 'svelte/store';
    import { onMount } from 'svelte';
    import { fetchAllEntities, fetchAllKeywords, fetchAllTopics } from '../../../../sqlite/sqlHandler';
    import Toast from '../../analysis_tab/Toast.svelte';
  
    export let textSearch = writable('');
    export let selectedEntities = writable([]);
    export let selectedKeywords = writable([]);
    export let selectedTopics = writable([]);
    export let dateRange = writable({ start: '', end: '' });
    let toastMessage = writable('');
  
    let entityOptions = writable<string[]>([]);
    let keywordOptions = writable<string[]>([]);
    let topicOptions = writable<string[]>([]);
  
    onMount(async () => {
      entityOptions.set(await fetchAllEntities());
      keywordOptions.set(await fetchAllKeywords());
      topicOptions.set(await fetchAllTopics());
    });
  
    function resetFilters() {
      textSearch.set('');
      selectedEntities.set([]);
      selectedKeywords.set([]);
      selectedTopics.set([]);
      dateRange.set({ start: '', end: '' });
    }
  
    function applyFilters() {
      toastMessage.set('Filters applied successfully!');
      // This function should trigger the filter application process.
      // Placeholder for actual implementation.
      console.log('Applying filters...');
    }
  </script>
  
  <div class="filter-container">
    <div class="filter-group">
      <label for="text-search">Search Text</label>
      <input type="text" id="text-search" bind:value={$textSearch} />
    </div>
  
    <div class="filter-group">
      <label for="entity-select">Select Entities</label>
      <div class="select-container">
        <select id="entity-select" multiple bind:value={$selectedEntities}>
          {#each $entityOptions as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
      </div>
    </div>
  
    <div class="filter-group">
      <label for="keyword-select">Select Keywords</label>
      <div class="select-container">
        <select id="keyword-select" multiple bind:value={$selectedKeywords}>
          {#each $keywordOptions as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
      </div>
    </div>
  
    <div class="filter-group">
      <label for="topic-select">Select Topics</label>
      <div class="select-container">
        <select id="topic-select" multiple bind:value={$selectedTopics}>
          {#each $topicOptions as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
      </div>
    </div>
  
    <div class="filter-group">
      <label for="start-date">Start Date</label>
      <input type="date" id="start-date" bind:value={$dateRange.start} />
    </div>
  
    <div class="filter-group">
      <label for="end-date">End Date</label>
      <input type="date" id="end-date" bind:value={$dateRange.end} />
    </div>
  
    <div class="filter-buttons">
      <button class="apply-button" on:click={applyFilters}>Apply Filters</button>
      <button class="reset-button" on:click={resetFilters}>Reset Filters</button>
    </div>
  
    <Toast bind:message={toastMessage} />
  </div>
  
  <style lang="scss">
    @import './FilterOptions.scss';
  </style>
  