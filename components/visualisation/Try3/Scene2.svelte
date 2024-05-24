<script lang="ts">
    import { onMount } from 'svelte';
    import { Canvas, T } from '@threlte/core';
    import { OrbitControls } from '@threlte/extras';
    import { forceDirectedLayout } from './PositionCalculation';
    import { fetchDetailedDocumentData } from 'sqlite/sqlHandler';
  
    let documents = [];
    let nodes: any[] = [];
  
    async function fetchAndProcessDocuments() {
      documents = await fetchDetailedDocumentData();
      nodes = forceDirectedLayout(documents);
      console.log(nodes);
      console.log(documents);
    }
  
    function convertPosition(position: { x: number, y: number }): [number, number] {
      return [position.x, position.y];
    }
  
    onMount(() => {
      fetchAndProcessDocuments();
    });
  </script>
  
  <Canvas>
    <T.PerspectiveCamera makeDefault position={[0, 0, 1000]} on:create={({ ref }) => ref.lookAt(0, 0, 0)}>
      <OrbitControls />
    </T.PerspectiveCamera>
    <T.AmbientLight intensity={0.3} />
    <T.DirectionalLight position={[3, 10, 7]} intensity={1} />
  
    {#each nodes as node}
      <T.Mesh position={[node.x, node.y, 0]}>
        <T.BoxGeometry args={[20, 20, 20]} />
        <T.MeshStandardMaterial color='#ffcc00' />
      </T.Mesh>
  
      {#each node.connections as conn}
        {#if nodes.find(n => n.id === conn)}
          <T.Line>
            <geometry>
              <T.BufferGeometry>
                <T.BufferAttribute 
                  attach="attributes-position" 
                  array={new Float32Array([node.x, node.y, 0, nodes.find(n => n.id === conn).x, nodes.find(n => n.id === conn).y, 0])} 
                  itemSize={3} 
                />
              </T.BufferGeometry>
            </geometry>
            <T.LineBasicMaterial color='#ff0000' linewidth={2} />
          </T.Line>
        {/if}
      {/each}
    {/each}
  
    <T.GridHelper args={[50, 50, 1, '#FE3D00', '#FE3D00']} />
  </Canvas>
  