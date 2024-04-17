// Import necessary utilities and types
import { writable } from 'svelte/store';
import { callGPT4forConnections } from '../../nlp/nlpService';
import { db, fetchAllDocumentData, saveConnectionAnalysisResults } from 'sqlite/sqlHandler';
import { TopicGroup, TopicConnection } from '../../model'

export const isConnectionAnalysisLoading = writable(false);
export const connectionAnalysisErrorMessage = writable('');

/**
 * Handle the analysis of connections
 */
export async function handleAnalyseConnections() {
  isConnectionAnalysisLoading.set(true);
  connectionAnalysisErrorMessage.set('');
  try {
    const results = await callGPT4forConnections();
    const parsedResults = typeof results === 'string' ? JSON.parse(results) : null;
    await saveConnectionAnalysisResults(parsedResults);
    console.log("Analysis processed and saved successfully.");
  } catch (error) {
    console.error("Error during text connection analysis:", error);
    connectionAnalysisErrorMessage.set("Failed to process and save analysis: " + error.message);
  } finally {
    isConnectionAnalysisLoading.set(false);
  }
}

/**
 * Fetches all topic connections and groups them by shared topics.
 */
export async function fetchAndGroupTopicConnections(): Promise<{ [key: string]: any[] }> {
  const connections = await db.documentConnections.toArray();
  let topicGroups: { [key: string]: any[] } = {};

  connections.forEach((conn: any) => {
      if (conn.connectionType === 'topics') {
          const key = conn.sharedAttributes.join(', ');
          if (!topicGroups[key]) {
              topicGroups[key] = [];
          }
          topicGroups[key].push(conn);
      }
  });

  return topicGroups;
}

// Constants for island size
const BLOCK_SIZE = 1;  // Assuming each block is 1x1 units
const MIN_ISLAND_SIZE = 2;  // Minimum size of each side of an island


const layoutPositions = (count: number): { x: number, z: number }[] => {
  let positions = [];
  let gridSize = Math.ceil(Math.sqrt(count));
  gridSize = Math.max(MIN_ISLAND_SIZE, gridSize); // Ensure at least a 2x2 grid
  for (let i = 0; i < gridSize * gridSize; i++) { // Fill the whole grid square
    let x = (i % gridSize) * BLOCK_SIZE;
    let z = Math.floor(i / gridSize) * BLOCK_SIZE;
    positions.push({ x, z });
  }
  return positions;
};


export async function generateTopicIslands(): Promise<any[]> {
  const topicGroups = await fetchAndGroupTopicConnections();
  let islands: any = [];
  const baseRadius = 5; // Reduce the base radius for a tighter circle
  const angleIncrement = 2 * Math.PI / Object.keys(topicGroups).length; // Angle between each island

  let currentAngle = 0;
  Object.keys(topicGroups).forEach((topic, index) => {
    const connections = topicGroups[topic];
    const numBlocks = connections.length;
    const gridSize = Math.max(MIN_ISLAND_SIZE, Math.ceil(Math.sqrt(numBlocks)));
    const positions = layoutPositions(gridSize * gridSize); // Ensure square grid

    // Adjust the radius increment based on the grid size to keep islands closer
    const radius = baseRadius + gridSize * 1.1; // Smaller multiplier for radius increment
    const xCenter = radius * Math.cos(currentAngle);
    const zCenter = radius * Math.sin(currentAngle);
    const models = positions.map(pos => ({
      model: 'path/to/grassBlock.glb',  // Ensure correct path
      x: pos.x + xCenter,
      z: pos.z + zCenter,
      scale: 1  // Adjust scale if needed
    }));

    islands.push({ topic, models });
    currentAngle += angleIncrement;
  });

  return islands;
}
