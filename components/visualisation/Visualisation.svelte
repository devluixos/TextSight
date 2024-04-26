<script>
  import { onMount } from 'svelte';

  //All aframe imports
  import "aframe";
  import "aframe-orbit-controls";
  import { generateDocumentIslands } from "./VisualisationLogic";
  import "./InfoPanelLogic";

  //models
  import skyboxImage from "./assets/skyboxes/sky_test.glb";
  import grassBlock from "./assets/3dmodels/grassBlock.glb";

  let islands = [];
  let info = {
    title: "My Title",
    description: "This is a description."
  };

  let infoString = JSON.stringify(info);


  onMount(async () => {
    islands = await generateDocumentIslands();
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



// if (!AFRAME.components['spawn-on-click']) {
//   AFRAME.registerComponent('spawn-on-click', {
//     init: function() {
//       var el = this.el;
//       el.addEventListener('click', function() {
//         var sceneEl = document.querySelector('a-scene');
//         var newEntity = document.createElement('a-entity');
//         newEntity.setAttribute('geometry', {primitive: 'box', height: 1, width: 1, depth: 1});
//         newEntity.setAttribute('material', {color: '#00FF00'});
//         newEntity.setAttribute('position', {x: (Math.random() - 0.5) * 20, y: 0.5, z: (Math.random() - 0.5) * 20});
//         sceneEl.appendChild(newEntity);
//       });
//     }
//   });
// }
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
  <!-- Visualisations from TextSight -->
  <a-entity gltf-model={grassBlock} position="1 1 1" 
        class="clickable"
        cursor-listener
        info-panel
        data-info={infoString}>
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

</a-scene> 

<style>
    a-scene {
      display: block; 
      width: 100%; 
      height: 100%; 
    }


</style>