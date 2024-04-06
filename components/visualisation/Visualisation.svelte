<script>
  import { onMount, onDestroy } from 'svelte';
  import { db } from '../../sqlite/sqlHandler';

  //All aframe imports
  import "aframe";
  import "aframe-orbit-controls";
  import skyboxImage from "./assets/skyboxes/sky_test.glb";
  import trees from "./assets/3dmodels/trees.glb";
  import GroundGras from "./assets/textures/GroundGrassGreen002_COL_2K.jpg";
  import GroundTexture from "./assets/textures/GroundGrassGreen002_NRM_2K.jpg";

  let models = [];
  let selectedModel = null;

  $: if (selectedModel !== null) {
    const cameraEl = document.querySelector('a-camera');
    cameraEl.setAttribute('orbit-controls', 'target', `#model${selectedModel}`);
    console.log(`Selected model: ${selectedModel}`);
  }
  onMount(async () => {
    //setupMouseNavigation();
      const documents = await db.documents.toArray();
      models = documents.map(doc => trees); // Simplified for example
  });

  onDestroy(() => {
    // Find and remove dynamic entities or reset the scene as needed
    const sceneEl = document.querySelector('a-scene');
    if (sceneEl) {
      // Remove all entities added dynamically or reset state as needed
      sceneEl.querySelectorAll('.dynamic-entity').forEach(entity => {
        console.log('Removing entity:', entity);
        entity.parentNode.removeChild(entity);
      });
    }  
  });
</script>

<!-----------------------------------------------------------------
a-frame scene and all aframe elements
------------------------------------------------------------------>
<a-scene>
  <a-sky gltf-model={skyboxImage} ></a-sky>
  <!-- Enlarged ground plane -->
  <a-plane position="0 0 0" rotation="-90 0 0" width="20" height="20"
        src={GroundGras}
        material="repeat: 20 20"
        normal-map={GroundTexture}
        normal-texture-repeat="20 20">
  </a-plane>

  <a-entity camera look-controls="enabled: false" 
            orbit-controls="target: 0 2 0; minDistance: 2; maxDistance: 180; initialPosition: 0 3 5; rotateSpeed: 0.5">
  </a-entity>
    
  {#each models as modelPath, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <a-entity
      id={`model${index}`}
      gltf-model={modelPath}
      position="{`${index * 2} 0.5 ${index}`}"
      on:click={() => selectedModel = index}
    ></a-entity>
  {/each}
  
</a-scene> 

<style>
    a-scene {
      display: block; 
      width: 100%; 
      height: 100%; 
    }
</style>