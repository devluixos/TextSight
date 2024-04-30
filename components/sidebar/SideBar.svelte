<script lang="ts">
  import Analysis from './analysis_tab/SideBar_analysis.svelte';
  import TextSightTab from './textsight_tab/SideBar_textsight.svelte';

  let activeTab = 'Analysis';
</script>

<div class="header">
  <h3>TextSight</h3>
</div>

<div class="tabs-container">
  <button class={activeTab === 'Analysis' ? 'tab active' : 'tab'} on:click={() => (activeTab = 'Analysis')}>Analysis</button>
  <button class={activeTab === 'TextSight' ? 'tab active' : 'tab'} on:click={() => (activeTab = 'TextSight')}>TextSight</button>
</div>

{#if activeTab === 'Analysis'}
  <Analysis />
{:else if activeTab === 'TextSight'}
  <TextSightTab />
{/if}

<style lang="scss">
  @import './SideBar.scss';
</style>