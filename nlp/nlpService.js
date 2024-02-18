import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
const nlp = winkNLP(model);
// Helpers for extracting properties and reducing collections
const its = nlp.its;
const as = nlp.as;

export function analyzeText(text) {
  if (typeof text !== 'string') {
    console.error('analyzeText expects a string');
    return;
  }

  const doc = nlp.readDoc(text);

  // Example: NER with detail
  const entitiesWithDetail = doc.entities().out(its.detail);
  console.log('Entities with Detail:', entitiesWithDetail);

  // Additional analyses can be performed here
  // Example: Frequency table of token types
  const tokenTypesFreq = doc.tokens().out(its.type, as.freqTable);
  console.log('Token Types Frequency:', tokenTypesFreq);

  // Sentences
  const sentences = doc.sentences().out();
  console.log('Sentences:', sentences);

  // Tokens
  const tokens = doc.tokens().out();
  console.log('Tokens:', tokens);

  // Returning entities as an example, but you can return any analysis you need
  return entitiesWithDetail;
}
