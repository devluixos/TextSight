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


// Function to generate grid positions for a given number of blocks
const layoutPositions = (count: number): { x: number, z: number }[] => {
  let positions = [];
  let gridSize = Math.max(MIN_ISLAND_SIZE, Math.ceil(Math.sqrt(count)));

  for (let i = 0; i < count; i++) {
    let x = (i % gridSize) * BLOCK_SIZE;
    let z = Math.floor(i / gridSize) * BLOCK_SIZE;
    positions.push({ x, z });
  }

  return positions;
};

// Function to generate islands with no gaps between models
export async function generateTopicIslands(): Promise<any[]> {
  const topicGroups = await fetchAndGroupTopicConnections();
  let islands: any = [];
  let xOffset = 0;  // Offset to prevent overlapping of islands

  Object.keys(topicGroups).forEach(topic => {
    const connections = topicGroups[topic];
    const numBlocks = Math.max(MIN_ISLAND_SIZE * MIN_ISLAND_SIZE, connections.length);
    const positions = layoutPositions(numBlocks);
    const models = positions.map(pos => ({
      model: 'path/to/grassBlock.glb',  // Ensure correct path
      x: pos.x + xOffset,
      z: pos.z
    }));

    islands.push({ topic, models });
    xOffset += Math.sqrt(numBlocks) * BLOCK_SIZE;  // Move xOffset for the next island
  });

  return islands;
}
