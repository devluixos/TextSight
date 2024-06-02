<script lang="ts">
    import { T } from '@threlte/core';
    import * as THREE from 'three';
  
    interface Connection {
      from: string;
      to: string;
    }
  
    interface NodePosition {
      x: number;
      y: number;
      z: number;
    }
  
    export let connections: Connection[] = [];
    export let nodePositions: { [key: string]: NodePosition } = {};
  
    // Function to get positions from document IDs
    function getPositionFromId(documentId: string) {
      const pos = nodePositions[documentId];
      return new THREE.Vector3(pos.x, pos.y, pos.z);
    }
  
    // Function to create path geometry
    function createPathGeometry(fromPos: THREE.Vector3, toPos: THREE.Vector3) {
      const points = [fromPos, toPos];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return geometry;
    }
  </script>
  
  <!-- Paths -->
  {#each connections as connection}
    {#if nodePositions[connection.from] && nodePositions[connection.to]}
      <T.Line geometry={createPathGeometry(getPositionFromId(connection.from), getPositionFromId(connection.to))}>
        <T.LineBasicMaterial color="gray" />
      </T.Line>
    {/if}
  {/each}
  