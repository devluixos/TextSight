<!-- AnalysisTab.svelte -->
<script lang="ts">
  import { get, writable } from 'svelte/store';
  import EntityList from './EntityList/EntityList.svelte';
  import KeywordList from './KeywordList/KeywordList.svelte';
  import TopicList from './TopicList/TopicList.svelte';
  import ConnectionList from './ConnectionList/ConnectionList.svelte';
  import AnalyseDocument from './AnalyseDocument/AnalyseDocument.svelte';


  let selectedLeaf = writable<any | null>(null);
  let documentPath = writable<string | null>(null);
  let isEntitiesOpen = writable(false);
  let isKeywordsOpen = writable(false);
  let isTopicsOpen = writable(false);
  let isConnectionsOpen = writable(false);


  function handleLeafSelection() {
    let leaf = get(selectedLeaf).view.file.path;
    if (leaf) {
      documentPath.set(leaf);
    }
  }

</script>

<AnalyseDocument />

<div class="accordion">
  <div>
    <button class="accordion-button" on:click={() => isEntitiesOpen.set(!get(isEntitiesOpen))}>Entities</button>
    {#if $isEntitiesOpen}
      <div class="accordion-content">
        <EntityList />
      </div>
    {/if}
  </div>
  <div>
    <button class="accordion-button" on:click={() => isKeywordsOpen.set(!get(isKeywordsOpen))}>Keywords</button>
    {#if $isKeywordsOpen}
      <div class="accordion-content">
        <KeywordList />
      </div>
    {/if}
  </div>
  <div>
    <button class="accordion-button" on:click={() => isTopicsOpen.set(!get(isTopicsOpen))}>Topics</button>
    {#if $isTopicsOpen}
      <div class="accordion-content">
        <TopicList />
      </div>
    {/if}
  </div>
  <div>
    <button class="accordion-button" on:click={() => isConnectionsOpen.set(!get(isConnectionsOpen))}>Connected Documents</button>
    {#if $isConnectionsOpen}
      <div class="accordion-content">
        <ConnectionList />
      </div>
    {/if}
  </div>
</div>
  
<style lang="scss">
  @import './SideBar_analysis.scss';
</style>
