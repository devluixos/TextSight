<script lang="ts">
  import { generateResponse } from '../../nlp/nlpService';

  let activeTab = 'Home';
  let sampleText = 'The name of Zermatt, as well as that of the Matterhorn itself, derives from the alpine meadows, or matten (in German), in the valley. The name appeared first as Zur Matte ("at the meadow") and became later Zermatt. It does not appear until 1495 on a map or 1546 in a text, but may have been employed long before.' +
  'Praborno or Prato Borno (Prato also means meadow) are the older names of Zermatt; they appear in the ancient maps as early as the thirteenth century.[5] The Romand-speaking people from the Aosta Valley and from the Romand-speaking part of canton Wallis (Valais) used this name until about 1860 in the form of Praborne, or Praborgne.' + 
  'The reason of this change from Praborno to Zermatt is attributed to the gradual replacement of the Romance-speaking people by German-speaking colony.[6][7]';

  let responseText = ''; // Add this line

  async function analyzeText(text: string) {
    responseText = await generateResponse(text); // Modify this line
    console.log(responseText);
  }
</script>

<div class="tabs-container">
<button class="tab" on:click={() => (activeTab = 'Home')}>Home</button>
<button class="tab" on:click={() => (activeTab = 'Merchandise')}>Merchandise</button>
</div>

{#if activeTab === 'Home'}
<div class="content home-content">
  Content 1
  <button on:click={() => analyzeText(sampleText)}>Analyze Text</button>
  <p>{responseText}</p>
</div>
{:else if activeTab === 'Merchandise'}
<div class="content merchandise-content">Content 2</div>
{/if}

<style lang="scss">
  @import './SideBar.scss';
</style>
