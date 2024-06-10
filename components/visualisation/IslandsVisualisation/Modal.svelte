<script lang="ts">
	import { DocumentDetail } from "model";
	import { selectedDocument } from "./parameters";
	import { Billboard, HTML } from "@threlte/extras";
	import Accordeon from "components/shared/accordeon/accordeon.svelte";
	import Panel from "components/shared/accordeon/panel.svelte";

	let isOpen = false;
	let document: DocumentDetail | null = null;
	let position: [number, number, number] | null = null;
	const fallbackPosition: [number, number, number] = [0, 0, 0];

	selectedDocument.subscribe(({ document: doc, position: pos }) => {
		document = doc;
		position = pos;
		isOpen = !!doc;
		if (isOpen) {
			console.log("Modal mounted with document:", document);
		}
	});

	const closeModal = () => {
		selectedDocument.set({ document: null, position: null });
		isOpen = false;
	};

	function groupConnectionsByType(connections: any[]) {
		const groupedConnections: { [key: string]: any[] } = {};
		connections.forEach((conn) => {
			const type = conn.connectionType || "unknown";
			if (!groupedConnections[type]) {
				groupedConnections[type] = [];
			}
			groupedConnections[type].push(conn);
		});
		return groupedConnections;
	}
</script>

{#if isOpen && document}
	<HTML position={position || fallbackPosition} center>
		<Billboard>
			<div class="modal">
				<div class="modal-content">
					<button class="close" on:click={closeModal}>&times;</button>
					<h2>{document.documentId}</h2>

					<Accordeon>
						<Panel label="Connections" id="connections">
							<div class="section-content">
								{#each Object.entries(groupConnectionsByType(document.connections)) as [type, conns]}
									<h4>{type}</h4>
									<ul>
										{#each conns as conn}
											<li>
												{conn.connectedDocumentId} ({conn.weight})
												<ul>
													{#each conn.sharedAttributes || [] as attr}
														<li>{attr}</li>
													{/each}
												</ul>
											</li>
										{/each}
									</ul>
								{/each}
							</div>
						</Panel>

						<Panel label="Topics" id="topics">
							<div class="section-content">
								<table>
									<thead>
										<tr>
											<th>Name</th>
											<th>Weight</th>
										</tr>
									</thead>
									<tbody>
										{#each document.topics as topic}
											<tr>
												<td>{topic.name}</td>
												<td>{topic.weight}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</Panel>
					</Accordeon>

					<Panel label="Entities" id="entities">
						<div class="section-content">
							<table>
								<thead>
									<tr>
										<th>Text</th>
										<th>Type</th>
										<th>Weight</th>
									</tr>
								</thead>
								<tbody>
									{#each document.entities as entity}
										<tr>
											<td>{entity.text}</td>
											<td>{entity.type}</td>
											<td>{entity.weight}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</Panel>

					<Panel label="Keywords" id="keywords">
						<div class="section-content">
							<table>
								<thead>
									<tr>
										<th>Keyword</th>
										<th>Weight</th>
									</tr>
								</thead>
								<tbody>
									{#each document.keywords as keyword}
										<tr>
											<td>{keyword.keyword}</td>
											<td>{keyword.weight}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</Panel>
				</div>
			</div>
		</Billboard>
	</HTML>
{/if}

<style lang="scss">
	@import "ModalStyle.scss";
</style>
