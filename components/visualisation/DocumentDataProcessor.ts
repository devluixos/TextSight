// Import your database configuration and required libraries
import { DocumentDetail } from 'model';
import { fetchDetailedDocumentData } from '../../sqlite/sqlHandler';

// Use the function in your components or services
async function loadAndProcessData() {
    try {
        const detailedDocuments = await fetchDetailedDocumentData();
        console.log("Documents fetched successfully:", detailedDocuments);
        // Further processing or state updates here
    } catch (error) {
        console.error("Failed to fetch detailed documents:", error);
    }
}

// Optionally, you can create additional functions to filter or restructure this data based on various criteria
export function filterDocumentsByTopic(documents: DocumentDetail[], topicName: string): DocumentDetail[] {
    return documents.filter(doc => doc.topics.some(topic => topic.name === topicName));
}

function identifyClusters(documents: DocumentDetail[]): DocumentDetail[][] {
    const clusters: DocumentDetail[][] = [];
    const visited = new Set<string>();

    function dfs(document: DocumentDetail, cluster: DocumentDetail[]) {
        visited.add(document.documentId);
        cluster.push(document);
        document.connections.forEach(conn => {
            const targetDoc = documents.find(d => d.documentId === conn.connectedDocumentId);
            if (targetDoc && !visited.has(targetDoc.documentId)) {
                dfs(targetDoc, cluster);
            }
        });
    }

    documents.forEach(doc => {
        if (!visited.has(doc.documentId)) {
            const cluster: DocumentDetail[] = [];
            dfs(doc, cluster);
            clusters.push(cluster);
        }
    });

    return clusters;
}

const width = 50;
const height = 50;
const maxIterations = 500;
const scale = 0.1;
const centralPoint = { x: 0, y: 0, z: 0 };
const connectionStrength = 0.1;
const repulsionStrength = 0.01;
const clusterRepulsionStrength = 0.1;

export function improvedClusteredLayout(documents: DocumentDetail[]): DocumentDetail[] {
    const clusters = identifyClusters(documents);
    const k = Math.sqrt((width * height) / documents.length);

    clusters.forEach(cluster => {
        // Initialize positions and forces for each document in the cluster
        cluster.forEach(doc => {
            if (!doc.position) {
                doc.position = {
                    x: (Math.random() * width - width / 2) * scale,
                    y: 0,
                    z: (Math.random() * height - height / 2) * scale
                };
            }
            if (!doc.force) {
                doc.force = { x: 0, y: 0, z: 0 };
            }
        });

        for (let iteration = 0; iteration < maxIterations; iteration++) {
            // Calculate repulsive forces within the cluster
            cluster.forEach((doc1, i) => {
                doc1.force = { x: 0, y: 0, z: 0 };
                cluster.forEach((doc2, j) => {
                    if (i !== j) {
                        const dx = doc1.position!.x - doc2.position!.x;
                        const dz = doc1.position!.z - doc2.position!.z;
                        const distance = Math.sqrt(dx * dx + dz * dz) || 1;
                        const repulsiveForce = k * k / distance * repulsionStrength;
                        doc1.force!.x += (dx / distance) * repulsiveForce * scale;
                        doc1.force!.z += (dz / distance) * repulsiveForce * scale;
                    }
                });
            });

            // Calculate attractive forces within the cluster
            cluster.forEach(doc => {
                doc.connections.forEach(conn => {
                    const targetDoc = cluster.find(d => d.documentId === conn.connectedDocumentId);
                    if (targetDoc) {
                        const dx = doc.position!.x - targetDoc.position!.x;
                        const dz = doc.position!.z - targetDoc.position!.z;
                        const distance = Math.sqrt(dx * dx + dz * dz) || 1;
                        const attractiveForce = (distance * distance) / k * connectionStrength;
                        doc.force!.x -= (dx / distance) * attractiveForce * scale;
                        doc.force!.z -= (dz / distance) * attractiveForce * scale;
                        targetDoc.force!.x += (dx / distance) * attractiveForce * scale;
                        targetDoc.force!.z += (dz / distance) * attractiveForce * scale;
                    }
                });
            });

            // Update positions within the cluster
            cluster.forEach(doc => {
                doc.position!.x += doc.force!.x;
                doc.position!.z += doc.force!.z;

                // Ensure positions stay within bounds
                doc.position!.x = Math.min(width / 2, Math.max(-width / 2, doc.position!.x));
                doc.position!.z = Math.min(height / 2, Math.max(-height / 2, doc.position!.z));
            });
        }
    });

    // Position clusters relative to each other
    clusters.forEach((cluster, i) => {
        cluster.forEach(doc1 => {
            clusters.forEach((otherCluster, j) => {
                if (i !== j) {
                    otherCluster.forEach(doc2 => {
                        const dx = doc1.position!.x - doc2.position!.x;
                        const dz = doc1.position!.z - doc2.position!.z;
                        const distance = Math.sqrt(dx * dx + dz * dz) || 1;
                        const repulsiveForce = k * k / distance * clusterRepulsionStrength;
                        doc1.force!.x += (dx / distance) * repulsiveForce * scale;
                        doc1.force!.z += (dz / distance) * repulsiveForce * scale;
                    });
                }
            });
        });

        // Update cluster positions with central point attraction
        cluster.forEach(doc => {
            doc.position!.x += doc.force!.x;
            doc.position!.z += doc.force!.z;

            // Attract towards central point
            const dx = centralPoint.x - doc.position!.x;
            const dz = centralPoint.z - doc.position!.z;
            doc.position!.x += dx * 0.01; // Adjust the strength of central attraction
            doc.position!.z += dz * 0.01;

            // Ensure positions stay within bounds
            doc.position!.x = Math.min(width / 2, Math.max(-width / 2, doc.position!.x));
            doc.position!.z = Math.min(height / 2, Math.max(-height / 2, doc.position!.z));
        });
    });

    return documents;
}
