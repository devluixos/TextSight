// src/parameters.ts
import { writable } from 'svelte/store';

// Define the parameters you want to share
export const leafId = writable<string | null>(null);
export const isLoading = writable(false);
export const loadingMessage = writable('');
export const selectedLeaf = writable<any | null>(null);
