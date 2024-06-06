<!-- AnalysisTab.svelte -->
<script lang="ts">
  import { get, writable } from 'svelte/store';
  import DocumentControl from './DocumentControl.svelte';
  import EntityList from './EntityList/EntityList.svelte';
  import KeywordList from './KeywordList/KeywordList.svelte';
  import TopicList from './TopicList/TopicList.svelte';
  import ConnectionList from './ConnectionList.svelte';


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

<DocumentControl />

<div class="accordion">
  <div>
    <button on:click={() => isEntitiesOpen.set(!get(isEntitiesOpen))}>Entities</button>
    {#if $isEntitiesOpen}
      <EntityList />
    {/if}
  </div>
  <div>
    <button on:click={() => isKeywordsOpen.set(!get(isKeywordsOpen))}>Keywords</button>
    {#if $isKeywordsOpen}
      <KeywordList />
    {/if}
  </div>
  <div>
    <button on:click={() => isTopicsOpen.set(!get(isTopicsOpen))}>Topics</button>
    {#if $isTopicsOpen}
      <TopicList />
    {/if}
  </div>
  <div>
    <button on:click={() => isConnectionsOpen.set(!get(isConnectionsOpen))}>Connected Documents</button>
    {#if $isConnectionsOpen}
      <ConnectionList documentId={$selectedLeaf?.id} />
    {/if}
  </div>
</div>
  
<style lang="scss">
  @import './SideBar_analysis.scss';
</style>
