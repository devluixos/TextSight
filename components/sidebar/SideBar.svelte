<!-- Sidebar.svelte or similar -->
<script lang="ts">
    import { analyzeText } from '../../nlp/nlpService';

    let activeTab = 'Home';

    function handleAnalyzeClick() {
      const sampleText = "Google was founded by Larry Page and Sergey Brin while they were Ph.D. students at Stanford University.";
      analyzeText(sampleText);
    }
</script>

<div class="tabs-container">
  <button class="tab" on:click={() => (activeTab = 'Home')}>Home</button>
  <button class="tab" on:click={() => (activeTab = 'Merchandise')}>Merchandise</button>
</div>

{#if activeTab === 'Home'}
  <div class="content home-content">
    Content 1
    <button on:click={handleAnalyzeClick}>Analyze Text</button>
  </div>
{:else if activeTab === 'Merchandise'}
  <div class="content merchandise-content">Content 2</div>
{/if}

<style lang="scss">
  @import './SideBar.scss';
</style>
