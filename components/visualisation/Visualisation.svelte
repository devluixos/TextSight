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
  import island from "./assets/3dmodels/island2.glb";
  import grassBlock from "./assets/3dmodels/grassBlock.glb";

  let models = [];
  let selectedModel = null;


  onMount(async () => {
    //setupMouseNavigation();
      const documents = await db.documents.toArray();
      models = documents.map(doc => trees); // Simplified for example
  });

  AFRAME.registerComponent('cursor-listener', {
      init: function () {
        this.el.addEventListener('click', evt => {
          let intersectedElement = this.el.components.raycaster.intersectedEls[0];
          if (intersectedElement) {
            intersectedElement.setAttribute('material', 'color', 'red');
          }
        });
      }
    });

  AFRAME.registerComponent('click-interaction', {
    init: function () {
      // Access the element
      var el = this.el;
      
      // Add click event listener with more detailed logging
      el.addEventListener('click', function (evt) {
        console.log('Element clicked!');
      });
    }
  });


  AFRAME.registerComponent('spawn-on-click', {
    init: function() {
      // Reference to the A-Frame element
      var el = this.el;

      // Click event listener
      el.addEventListener('click', function() {
        // Create a new entity for the grass block
        var sceneEl = document.querySelector('a-scene');
        var newEntity = document.createElement('a-entity');

        // Set the attributes for the new entity
        newEntity.setAttribute('geometry', {primitive: 'box', height: 1, width: 1, depth: 1});
        newEntity.setAttribute('material', {color: '#00FF00'});
        newEntity.setAttribute('position', {x: (Math.random() - 0.5) * 20, y: 0.5, z: (Math.random() - 0.5) * 20});

        // Add the new entity to the scene
        sceneEl.appendChild(newEntity);
      });
    }
  });
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
  <a-plane position="0 0 0" rotation="-90 0 0" width="20" height="20"
        src={GroundGras}
        material="repeat: 20 20"
        normal-map={GroundTexture}
        normal-texture-repeat="20 20">
  </a-plane>
  <a-entity camera id="camera" look-controls="enabled: false" 
            orbit-controls="target: 0 2 0; minDistance: 2; maxDistance: 180; initialPosition: 0 3 5; rotateSpeed: 0.5;"
            cursor-listener raycaster="objects: .clickable"
            class="clickable">
  </a-entity>
  <a-box position="0 1 -3" rotation="0 45 0" color="#4CC3D9" cursor-listener raycaster="objects: .clickable" class="clickable"></a-box>

  <!-- Visualisations from TextSight -->
  <a-entity gltf-model={grassBlock} position="1 1 1" click-interaction spawn-on-click></a-entity>
    
</a-scene> 

<style>
    a-scene {
      display: block; 
      width: 100%; 
      height: 100%; 
    }
</style>