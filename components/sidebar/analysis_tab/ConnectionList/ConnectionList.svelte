<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { EventRef } from 'obsidian';
    import { fetchConnectionsByDocumentId, addConnection, deleteSharedAttribute, updateConnection } from '../../../../sqlite/sqlHandler';
    import { writable, get } from 'svelte/store';
    import type { IDocumentConnection } from '../../../../model';
    import Toast from '../Toast.svelte';

    let documentId: string = '';
    let activeLeaf: any;
    let connections = writable<IDocumentConnection[]>([]);
    let groupedConnections = writable<Record<string, IDocumentConnection[]>>({});
    let message = writable<string>('');

    let newConnectionType = writable<string>('keywords');
    let newSharedAttribute = writable<string>('');
    let newWeight = writable<number>(0.5);

    let sortColumn = writable<string | null>(null);
    let sortDirection = writable<'asc' | 'desc'>('asc');

    async function updateActiveLeaf() {
        activeLeaf = app.workspace.activeLeaf;
        if (activeLeaf && activeLeaf.view && activeLeaf.view.file && activeLeaf.view.file.extension === 'md') {
            documentId = activeLeaf.view.file.path;
            await loadConnections();
        }
    }

    async function loadConnections() {
        const data = await fetchConnectionsByDocumentId(documentId);
        connections.set(data);
        groupConnectionsByConnectedDocument(data);
    }

    function groupConnectionsByConnectedDocument(data: IDocumentConnection[]) {
        const grouped: Record<string, IDocumentConnection[]> = data.reduce((acc: Record<string, IDocumentConnection[]>, conn: IDocumentConnection) => {
            if (!acc[conn.connectedDocumentId]) {
                acc[conn.connectedDocumentId] = [];
            }
            acc[conn.connectedDocumentId].push(conn);
            return acc;
        }, {});
        groupedConnections.set(grouped);
    }

    let unsubscribeActiveLeafChange: EventRef;

    onMount(() => {
        updateActiveLeaf();
        unsubscribeActiveLeafChange = app.workspace.on('active-leaf-change', updateActiveLeaf);
    });

    onDestroy(() => {
        app.workspace.off('active-leaf-change', unsubscribeActiveLeafChange as (...data: any) => any);
    });

    async function handleDeleteAttribute(connectedDocumentId: string, attribute: string) {
        await deleteSharedAttribute(documentId, connectedDocumentId, attribute);
        await loadConnections();
        message.set('Attribute deleted successfully');
    }

    async function handleAddConnection(connectedDocumentId: string) {
        const connection: IDocumentConnection = {
            documentId,
            connectedDocumentId,
            connectionType: get(newConnectionType),
            sharedAttributes: [get(newSharedAttribute)],
            weight: get(newWeight)
        };
        await addConnection(documentId, connection);
        await loadConnections();
        message.set('Connection added successfully');
        newConnectionType.set('keywords');
        newSharedAttribute.set('');
        newWeight.set(0.5);
    }

    async function handleUpdateConnection(connection: IDocumentConnection, index: number, field: string, value: string | number) {
        if (field === 'sharedAttribute') {
            connection.sharedAttributes[index] = value as string;
        } else if (field === 'weight') {
            connection.weight = value as number;
        }
        if (connection.id !== undefined) {
            await updateConnection(connection); // Pass only one argument
            await loadConnections();
            message.set('Connection updated successfully');
        } else {
            console.error("Connection ID is undefined", connection);
        }
    }

    function sortTable(column: string) {
        sortDirection.update(direction => direction === 'asc' ? 'desc' : 'asc');
        connections.update(data => {
            return [...data].sort((a, b) => {
                let aVal: any, bVal: any;
                if (column === 'sharedAttributes') {
                    aVal = a.sharedAttributes[0];
                    bVal = b.sharedAttributes[0];
                } else {
                    aVal = a[column as keyof IDocumentConnection];
                    bVal = b[column as keyof IDocumentConnection];
                }
                if (aVal === undefined) return 1;
                if (bVal === undefined) return -1;
                if (aVal < bVal) return get(sortDirection) === 'asc' ? -1 : 1;
                if (aVal > bVal) return get(sortDirection) === 'asc' ? 1 : -1;
                return 0;
            });
        });
    }
</script>

<div>
    <h3>Connections for {documentId}</h3>
    {#each Object.entries($groupedConnections) as [connectedDocumentId, connections]}
        <table class="connections-table">
            <thead>
                <tr>
                    <th colspan="4">{connectedDocumentId}</th>
                </tr>
                <tr>
                    <th on:click={() => sortTable('connectionType')}>Connection Type</th>
                    <th on:click={() => sortTable('sharedAttributes')}>Shared Attribute</th>
                    <th on:click={() => sortTable('weight')}>Weight</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each connections as connection}
                    {#each connection.sharedAttributes as attribute, i}
                        <tr>
                            <td class="connection-type">{connection.connectionType}</td>
                            <td>
                                <input type="text" bind:value={attribute} on:change={(e) => handleUpdateConnection(connection, i, 'sharedAttribute', e.currentTarget.value)} />
                            </td>
                            <td>
                                <input type="number" bind:value={connection.weight} min="0" max="1" step="0.01" on:change={(e) => handleUpdateConnection(connection, i, 'weight', parseFloat(e.currentTarget.value))} />
                            </td>
                            <td>
                                <button on:click={() => handleDeleteAttribute(connection.connectedDocumentId, attribute)}>Delete</button>
                            </td>
                        </tr>
                    {/each}
                {/each}
                <tr class="add-connection-row">
                    <td colspan="4">
                        <div class="add-connection-container">
                            <label>
                                Type:
                                <select bind:value={$newConnectionType}>
                                    <option value="keywords">Keywords</option>
                                    <option value="entities">Entities</option>
                                    <option value="topics">Topics</option>
                                </select>
                            </label>
                            <label>
                                Attribute:
                                <input type="text" bind:value={$newSharedAttribute} />
                            </label>
                            <label>
                                Weight:
                                <input type="number" bind:value={$newWeight} min="0" max="1" step="0.01" />
                            </label>
                            <button on:click={() => handleAddConnection(connectedDocumentId)}>Add</button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="spacer"></div>
    {/each}
    <Toast {message} />
</div>

<style lang="scss">
    @import './ConnectionList.scss';
  </style>