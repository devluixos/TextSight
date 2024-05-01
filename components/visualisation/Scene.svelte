<script lang="ts">
    import { T } from '@threlte/core'
    import { Grid, OrbitControls, interactivity } from '@threlte/extras'
    import { spring } from 'svelte/motion'
    import { visualizationData } from './Visualisation2';
  
    interactivity()
  
    const scale = spring(1)

    let nodes = [];
    $: nodes = $visualizationData; 
    console.log(nodes);
    


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
  
  <T.DirectionalLight
    position={[3, 10, 7]}
    intensity={Math.PI}
  />
  
  <T.AmbientLight intensity={0.3} />
  

  {#each nodes as node (node.id)}
    <T.Mesh position={[node.x, node.y, node.z]}>
      <T.SphereGeometry args={[1]} />
      <T.MeshStandardMaterial color="red" />
    </T.Mesh>
  {/each}
  
  <Grid
    cellColor="#FE3D00"
    sectionColor="#FE3D00"
  />
  