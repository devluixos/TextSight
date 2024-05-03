<script lang="ts">
    import { onMount } from 'svelte';
    import { T } from '@threlte/core';
    import { OrbitControls } from '@threlte/extras';
    import { visualizationData } from './Visualisation2';
    import { spring } from 'svelte/motion';

    import { generateDocumentIslandsAndBridges } from './VisualisationLogic';
    import grassBlock from "./assets/3dmodels/grassBlock.glb";
  
    let nodes: any[] = [];
    let lineVertices: number[][] = [];
  
    // Subscribe to the visualization data store
    const unsubscribe = visualizationData.subscribe(value => {
      nodes = value;
      updateLineVertices(); // Call this function whenever the nodes update to recalculate line vertices
    });
  

    let islands: any[] = [];
    let bridges: any[] = [];
      
    onMount(async () => {
        const { islands: loadedIslands, bridges: loadedBridges } = await generateDocumentIslandsAndBridges();
        islands = loadedIslands;
        bridges = loadedBridges;
    });


    // Clean up the subscription when the component unmounts
    onMount(() => {
      return () => unsubscribe();
    });
  
    // Function to calculate and update the line vertices based on node data
    function updateLineVertices() {
      lineVertices = [];
      nodes.forEach(node => {
        node.connections.forEach((connectionId: any) => {
          const targetNode = nodes.find(n => n.id === connectionId);
          if (targetNode) {
            lineVertices.push(
              [node.x, node.y, node.z],
              [targetNode.x, targetNode.y, targetNode.z]
            );
          }
        });
      });
    }
  
    const scale = spring(1, {
      stiffness: 0.1,
      damping: 0.2
    });
    console.log('1', nodes);
    console.log('2', lineVertices);
  </script>
  
    <T.PerspectiveCamera
      makeDefault
      position={[10, 10, 10]}
      on:create={({ ref }) => {
        ref.lookAt(0, 0, 0)
      }}
    >
        <OrbitControls />
    </T.PerspectiveCamera>
  
    <T.AmbientLight intensity={0.3} />
    <T.DirectionalLight position={[3, 10, 7]} intensity={Math.PI} />
  
    {#each islands as island}
        {#each island.models as model}
        <T.Mesh
            position={[model.x, 0, model.z]}
            scale={[1.5, 1.5, 1.5]}
        />
        {/each}
    {/each}

    {#each bridges as bridge}
        <T.Line
        points={[[bridge.start.x, bridge.start.y, bridge.start.z], [bridge.end.x, bridge.end.y, bridge.end.z]]}
        />
    {/each}
  
    <T.GridHelper args={[50, 50]} colorGrid="#FE3D00" colorCenterLine="#FE3D00" />
