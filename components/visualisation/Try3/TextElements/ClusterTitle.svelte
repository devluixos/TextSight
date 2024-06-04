<script lang="ts">
  import { Billboard, HTML } from '@threlte/extras';
  import { MeshLineGeometry, MeshLineMaterial } from '@threlte/extras';
  import { get } from 'svelte/store';
  import { min_cluster_visibility_distance, max_cluster_visibility_distance } from '../parameters';
  import { T } from '@threlte/core';
  import * as THREE from 'three';

  export let position: [number, number, number];
  export let text: string;
  export let cameraPosition: THREE.Vector3;

  function getTextOpacity(distance: number): number {
    const fadeStart = get(min_cluster_visibility_distance) - 10;
    const fadeEnd = get(max_cluster_visibility_distance);
    if (distance <= fadeStart || distance >= fadeEnd) return 0;
    if (distance > fadeStart && distance < fadeEnd) {
      return 1 - (Math.abs(distance - fadeStart) / (fadeEnd - fadeStart));
    }
    return 1;
  }

  function getDistance(cameraPosition: THREE.Vector3, centerPosition: [number, number, number]): number {
    const dx = cameraPosition.x - centerPosition[0];
    const dy = cameraPosition.y - centerPosition[1];
    const dz = cameraPosition.z - centerPosition[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  $: distance = getDistance(cameraPosition, position);
  $: opacity = getTextOpacity(distance);

  // Points for the line from the bottom of the billboard to 5 units downwards
  $: points = [
    new THREE.Vector3(position[0], position[1] + 15, position[2]),
    new THREE.Vector3(position[0], position[1] + 5, position[2])
  ];
</script>

<Billboard position={[position[0], position[1] + 15, position[2]]}>
  <HTML>
    <div class="text-container" style="opacity: {opacity}">
      <div class="text">{text}</div>
    </div>
  </HTML>
</Billboard>
<T.Mesh>
  <MeshLineGeometry points={points} />
  <MeshLineMaterial width={0.05} color="rgba(0, 0, 0)" opacity={opacity} transparent />
</T.Mesh>
  
  <style lang="scss">
    @import './ClusterTitle.scss';
  </style>
  
  