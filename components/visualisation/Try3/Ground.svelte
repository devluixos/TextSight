<script lang="ts">
  import { T } from '@threlte/core';
  import * as THREE from 'three';
  import { TextureLoader } from 'three';

  // Import ground textures
  import groundTexture from '../assets/textures/GroundGrassGreen002_COL_2K.jpg';

  // Load ground texture
  const textureLoader = new TextureLoader();
  const groundTextureMap = textureLoader.load(groundTexture);

  // Adjust texture settings
  groundTextureMap.wrapS = THREE.RepeatWrapping;
  groundTextureMap.wrapT = THREE.RepeatWrapping;
  groundTextureMap.repeat.set(20, 20); // Increase tiling for less repetition

  // Ground material with texture
  const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTextureMap });

  // Move the ground up by 1 unit
  const groundPosition = [0, 1, 0];
</script>

<T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
  <T.PlaneGeometry args={[500, 500]} /> <!-- Increase size for larger ground area -->
  <T.MeshStandardMaterial args={[groundMaterial]} />
</T.Mesh>
