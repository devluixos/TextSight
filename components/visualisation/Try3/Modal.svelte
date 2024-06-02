<script lang="ts">
  import { DocumentDetail } from 'model';
  import { onMount } from 'svelte';
  import { selectedDocument } from './parameters';
  import { get } from 'svelte/store';
  import { Billboard, HTML } from '@threlte/extras';
  import { writable } from 'svelte/store';

  let isOpen = false;
  let document: DocumentDetail | null = null;
  let position: [number, number, number] | null = null;
  const fallbackPosition: [number, number, number] = [0, 0, 0];

  const expandedSections = writable<{ [key: string]: boolean }>({
    connections: false,
    topics: false,
    entities: false,
    keywords: false
  });

  selectedDocument.subscribe(({ document: doc, position: pos }) => {
    document = doc;
    position = pos;
    isOpen = !!doc;
    if (isOpen) {
      console.log('Modal mounted with document:', document);
    }
  });

  const closeModal = () => {
    selectedDocument.set({ document: null, position: null });
    isOpen = false;
  };

  function toggleSection(section: string) {
    expandedSections.update(sections => {
      sections[section] = !sections[section];
      return sections;
    });
  }

  function groupConnectionsByType(connections: any[]) {
    const groupedConnections: { [key: string]: any[] } = {};
    connections.forEach(conn => {
      const type = conn.connectionType || 'unknown';
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

          <!-- Connections Section -->
          <div class="section">
            <button class="section-header" on:click={() => toggleSection('connections')}>
              <h3>Connections</h3>
            </button>
            {#if $expandedSections.connections}
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
            {/if}
          </div>

          <!-- Topics Section -->
          <div class="section">
            <button class="section-header" on:click={() => toggleSection('topics')}>
              <h3>Topics</h3>
            </button>
            {#if $expandedSections.topics}
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
            {/if}
          </div>

          <!-- Entities Section -->
          <div class="section">
            <button class="section-header" on:click={() => toggleSection('entities')}>
              <h3>Entities</h3>
            </button>
            {#if $expandedSections.entities}
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
            {/if}
          </div>

          <!-- Keywords Section -->
          <div class="section">
            <button class="section-header" on:click={() => toggleSection('keywords')}>
              <h3>Keywords</h3>
            </button>
            {#if $expandedSections.keywords}
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
            {/if}
          </div>

        </div>
      </div>
    </Billboard>
  </HTML>
{/if}

<style lang=scss>
  @import 'ModalStyle.scss';
</style>
