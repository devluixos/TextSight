import { writable } from 'svelte/store';

export const distance_threshold = writable(20);
export const min_visibility_distance = writable(2);
export const max_cluster_visibility_distance = writable(1000);
export const cluster_radius = writable(10);
export const min_cluster_visibility_distance = writable(20);
