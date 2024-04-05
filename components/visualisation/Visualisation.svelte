<script>
  import "aframe";

  import skyboxImage from "./assets/skyboxes/sky_test.glb";
  import trees from "./assets/3dmodels/trees.glb";
  import GroundGras from "./assets/textures/GroundGrassGreen002_COL_2K.jpg";
  import GroundTexture from "./assets/textures/GroundGrassGreen002_NRM_2K.jpg";
  import { onMount } from 'svelte';
  import { db } from '../../sqlite/sqlHandler';

  let models = [];
  onMount(async () => {
      const documents = await db.documents.toArray();
      models = documents.map(doc => trees); // Simplified for example
  });
</script>

<a-scene>
  <a-sky gltf-model={skyboxImage}></a-sky>
  <!-- Enlarged ground plane -->
  <a-plane position="0 0 -2" rotation="-90 0 0" width="100" height="100"
        src={GroundGras}
        material="repeat: 30 30"
        normal-map={GroundTexture}
        normal-texture-repeat="30 30">
    </a-plane>
  <a-camera>
    <a-cursor></a-cursor>
  </a-camera>
  {#each models as modelPath, index}
      <a-entity gltf-model={modelPath} position="{`${index * 2} 0.5 ${index}`}"></a-entity>
  {/each}
  <a-box></a-box>
</a-scene>

<style>
    a-scene {
      display: block; 
      width: 100%; 
      height: 100%; 
    }
</style>