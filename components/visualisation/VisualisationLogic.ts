import { writable } from 'svelte/store';
import { callGPT4forConnections } from '../../nlp/nlpService';
import { saveConnectionAnalysisResults } from '../../sqlite/sqlHandler';

export const isConnectionAnalysisLoading = writable(false);
export const connectionAnalysisErrorMessage = writable('');

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