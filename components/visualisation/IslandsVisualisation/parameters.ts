import { DocumentDetail } from 'model';
import { writable } from 'svelte/store';

export const distance_threshold = writable(50);
export const min_visibility_distance = writable(1);
export const cluster_radius = writable(10);
export const min_cluster_visibility_distance = writable(50);
export const max_cluster_visibility_distance = writable(300);


//Variables for the Modal
export const selectedDocument = writable<{ document: DocumentDetail | null, position: [number, number, number] | null }>({ document: null, position: null });