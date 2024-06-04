<script lang="ts">
  import { Billboard, HTML } from '@threlte/extras';
  import { get } from 'svelte/store';
  import { distance_threshold, min_visibility_distance } from '../parameters';
  import * as THREE from 'three';

  export let position: [number, number, number];
  export let text: string;
  export let keypoints: string[] = [];
  export let cameraPosition: THREE.Vector3;

  function getTextOpacity(distance: number): number {
    const fadeStart = get(min_visibility_distance);
    const fadeEnd = get(distance_threshold);
    if (distance <= fadeStart || distance >= fadeEnd) return 0;
    return 1 - (Math.abs(distance - fadeStart) / (fadeEnd - fadeStart));
  }

  function getDistance(cameraPosition: THREE.Vector3, centerPosition: [number, number, number]): number {
    const dx = cameraPosition.x - centerPosition[0];
    const dy = cameraPosition.y - centerPosition[1];
    const dz = cameraPosition.z - centerPosition[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  $: distance = getDistance(cameraPosition, position);
  $: opacity = getTextOpacity(distance);
</script>

<Billboard position={position}>
  <HTML>
    <div class="text-container" style="opacity: {opacity}">
      <div class="text">
        <div class="title">{text}</div>
        <ul class="keypoints">
          {#each keypoints as keypoint}
            <li>{keypoint}</li>
          {/each}
        </ul>
      </div>
    </div>
  </HTML>
</Billboard>
