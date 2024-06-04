<script lang="ts">
  import { Billboard, HTML } from '@threlte/extras';
  import { MeshLineGeometry, MeshLineMaterial } from '@threlte/extras';
  import { T } from '@threlte/core';
  import * as THREE from 'three';

  export let position: [number, number, number];
  export let text: string;
  export let keywords: { keyword: string, weight: number }[] = [];

  // Get the top 3 keywords based on weight
  $: topKeywords = keywords.sort((a, b) => b.weight - a.weight).slice(0, 3);

  // Points for the line from the bottom of the billboard to 5 units downwards
  $: points = [
    new THREE.Vector3(position[0], position[1] + 7, position[2]),
    new THREE.Vector3(position[0], position[1], position[2])
  ];
</script>

<Billboard position={[position[0], position[1] + 7, position[2]]}>
  <HTML>
    <div class="text-container">
      <div class="text">
        <div class="title">{text}</div>
        <ul class="keywords">
          {#each topKeywords as keyword}
            <li>{keyword.keyword}</li>
          {/each}
        </ul>
      </div>
    </div>
  </HTML>
</Billboard>
<T.Mesh>
  <MeshLineGeometry points={points} />
  <MeshLineMaterial width={0.05} color="rgba(0, 0, 0)" transparent />
</T.Mesh>

<style lang="scss">
  @import './DocumentTitle.scss';
</style>