<script>
  import { onMount } from 'svelte';

  //All aframe imports
  import "aframe";
  import "aframe-orbit-controls";
  import { generateDocumentIslandsAndBridges } from "./VisualisationLogic";
  import "./InfoPanelLogic";

  //models
  import skyboxImage from "./assets/skyboxes/sky_test.glb";
  import grassBlock from "./assets/3dmodels/grassBlock.glb";

  let islands = [];
  let bridges = [];

  onMount(async () => {
    const result = await generateDocumentIslandsAndBridges();
    islands = result.islands;
    bridges = result.bridges;
    console.log('Islands: ', islands);
    console.log('Bridges: ', bridges);
  });

  if (!AFRAME.components['cursor-listener']) {
    AFRAME.registerComponent('cursor-listener', {
      init: function () {
        this.el.addEventListener('click', evt => {
          const position = this.el.object3D.position.clone();
          const data = JSON.parse(this.el.getAttribute('data-info'));
        });
      }
    });
  }

</script>

<!-----------------------------------------------------------------
a-frame scene and all aframe elements
------------------------------------------------------------------>
<a-scene cursor="rayOrigin: mouse">
  <!-- Assets for the scene, camera fix -->
  <a-assets>
    <a-asset-item id="camera" look-controls="enabled: false" 
      orbit-controls="target: 0 2 0; minDistance: 2; maxDistance: 180; initialPosition: 0 3 5; rotateSpeed: 0.5">
    </a-asset-item>
  </a-assets> 

  <!-- Base scene structure -->
  <a-sky gltf-model={skyboxImage} ></a-sky>
  <a-entity camera id="camera" look-controls="enabled: false" 
        orbit-controls="target: 0 2 0; minDistance: 2; maxDistance: 180; initialPosition: 0 3 5; rotateSpeed: 0.5;"
        cursor-listener raycaster="objects: .clickable">
  </a-entity>
 

  {#each islands as island}
    <a-entity>
      {#each island.models as model}
        <a-entity
          gltf-model={grassBlock}
          position={`${model.x} 0 ${model.z}`}
          scale="1.5 1.5 1.5"
          color="#ffcc00"
          class="clickable"
          cursor-listener
          data-info={model.dataInfo}>
        </a-entity>
      {/each}
    </a-entity>
  {/each}
  <!-- Render bridges -->
  {#each bridges as bridge (bridge.start.x + ',' + bridge.start.z + '-' + bridge.end.x + ',' + bridge.end.z)}
    <a-entity line="start: {bridge.start.x} {bridge.start.y} {bridge.start.z}; end: {bridge.end.x} {bridge.end.y} {bridge.end.z}; color: red"></a-entity>
  {/each}

</a-scene> 

<style>
    a-scene {
      display: block; 
      width: 100%; 
      height: 100%; 
    }


</style>