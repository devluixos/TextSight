import { DocumentDetail } from 'model';
import { width, height, scale, attractionConstant, repulsionConstant, minRadius, iterations, maxProximity, centerPullStrength } from './parameters';

let widthVal: number;
let heightVal: number;
let scaleVal: number;
let attractionConstantVal: number;
let repulsionConstantVal: number;
let minRadiusVal: number;
let iterationsVal: number;
let maxProximityVal: number;
let centerPullStrengthVal: number;

width.subscribe(value => widthVal = value);
height.subscribe(value => heightVal = value);
scale.subscribe(value => scaleVal = value);
attractionConstant.subscribe(value => attractionConstantVal = value);
repulsionConstant.subscribe(value => repulsionConstantVal = value);
minRadius.subscribe(value => minRadiusVal = value);
iterations.subscribe(value => iterationsVal = value);
maxProximity.subscribe(value => maxProximityVal = value);
centerPullStrength.subscribe(value => centerPullStrengthVal = value);

export function initializePositions(documents: DocumentDetail[]): DocumentDetail[] {
  documents.forEach(doc => {
    doc.position = {
      x: (Math.random() * widthVal - widthVal / 2) * scaleVal,
      y: 0,
      z: (Math.random() * heightVal - heightVal / 2) * scaleVal,
    };
    doc.force = { x: 0, y: 0, z: 0 };
  });

  return documents;
}

function applyAttractionForces(documents: DocumentDetail[]): void {
  documents.forEach(doc => {
    doc.connections.forEach(conn => {
      const targetDoc = documents.find(d => d.documentId === conn.connectedDocumentId);
      if (targetDoc && targetDoc.position && doc.position) {
        const dx = targetDoc.position.x - doc.position.x;
        const dz = targetDoc.position.z - doc.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        const forceMagnitude = attractionConstantVal * conn.weight;

        doc.force!.x += (dx / distance) * forceMagnitude;
        doc.force!.z += (dz / distance) * forceMagnitude;
      }
    });
  });
}

function applyRepulsionForces(documents: DocumentDetail[]): void {
  documents.forEach(doc => {
    documents.forEach(otherDoc => {
      if (otherDoc !== doc && otherDoc.position && doc.position) {
        const dx = doc.position.x - otherDoc.position.x;
        const dz = doc.position.z - otherDoc.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance < maxProximityVal) {
          const overlap = maxProximityVal - distance;
          const forceMagnitude = repulsionConstantVal * overlap / (distance * distance);

          doc.force!.x += (dx / distance) * forceMagnitude;
          doc.force!.z += (dz / distance) * forceMagnitude;
        }
      }
    });
  });
}

function applyCenterPull(documents: DocumentDetail[]): void {
  documents.forEach(doc => {
    const dx = -doc.position!.x;
    const dz = -doc.position!.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const forceMagnitude = centerPullStrengthVal * distance;

    doc.force!.x += (dx / distance) * forceMagnitude;
    doc.force!.z += (dz / distance) * forceMagnitude;
  });
}

function updatePositions(documents: DocumentDetail[]): void {
  documents.forEach(doc => {
    if (doc.position && doc.force) {
      doc.position.x += doc.force.x;
      doc.position.z += doc.force.z;
    }
  });
}

export function runForceDirectedLayout(documents: DocumentDetail[]): void {
  for (let i = 0; i < iterationsVal; i++) {
    documents.forEach(doc => doc.force = { x: 0, y: 0, z: 0 });
    applyAttractionForces(documents);
    applyRepulsionForces(documents);
    applyCenterPull(documents);
    updatePositions(documents);
  }
}
