import { writable } from 'svelte/store';

export const width = writable(50);
export const height = writable(50);
export const scale = writable(1.0);
export const attractionConstant = writable(0.1); // Attraction force constant
export const repulsionConstant = writable(0.1); // Repulsion force constant
export const minRadius = writable(1); // Ensure they don't overlap
export const iterations = writable(1000); // Sufficient iterations for convergence
export const maxProximity = writable(5); // Max proximity for repulsion
export const centerPullStrength = writable(0.05);

export const repulsionStrength = writable(5.0);  // Reduced repulsion strength
export const connectionStrength = writable(0.05);  // Adjusted connection strength
export const centralAttractionStrength = writable(0.005);  // Adjusted central attraction strength
export const minDistance = writable(5.0);  // Minimum distance to reduce overlap
export const maxIterations = writable(500);  // Reduced number of iterations
export const dampingFactor = writable(0.5);  // Damping to slow down movement


export const clusterRepulsionStrength = writable(0.1);
