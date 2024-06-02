<script lang="ts">
    import { T } from '@threlte/core';
    import * as THREE from 'three';
  
    // Ground material
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Forest green color
  </script>
  
  <T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
    <T.PlaneGeometry args={[100, 100]} />
    <T.MeshStandardMaterial args={[groundMaterial]} />
  </T.Mesh>
  