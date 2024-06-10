<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { EventRef } from 'obsidian';
    import { fetchEntitiesByDocumentId, updateEntity, deleteEntity, addEntity } from '../../../../sqlite/sqlHandler';
    import { get, writable } from 'svelte/store';
    import Toast from '../Toast.svelte';

    let documentId: string = '';
    let activeLeaf: any;
    let entities = writable<any[]>([]);
    let sortedEntities = writable<any[]>([]);
    let sortColumn = writable<string | null>(null);
    let sortDirection = writable<'asc' | 'desc'>('asc');
    let saveIndicator = writable(false); // Indicator for save feedback
    let newEntity = writable({ text: '', type: '', weight: 0 });
    let message = writable<string>('');

    async function updateActiveLeaf() {
        activeLeaf = app.workspace.activeLeaf;
        if (activeLeaf && activeLeaf.view && activeLeaf.view.file && activeLeaf.view.file.extension === 'md') {
            documentId = activeLeaf.view.file.path;
            await loadEntities();
        }
    }

    async function loadEntities() {
        const data = await fetchEntitiesByDocumentId(documentId);
        entities.set(data);
        sortedEntities.set(data);
    }

    let unsubscribeActiveLeafChange: EventRef;

    onMount(() => {
        updateActiveLeaf();
        unsubscribeActiveLeafChange = app.workspace.on('active-leaf-change', updateActiveLeaf);
    });

    onDestroy(() => {
        app.workspace.off('active-leaf-change', unsubscribeActiveLeafChange as (...data: any) => any);
    });

    function sortTable(column: string) {
        sortDirection.update(direction => direction === 'asc' ? 'desc' : 'asc');
        sortedEntities.update(data => {
            const sorted = [...data].sort((a, b) => {
                if (a[column] < b[column]) return get(sortDirection) === 'asc' ? -1 : 1;
                if (a[column] > b[column]) return get(sortDirection) === 'asc' ? 1 : -1;
                return 0;
            });
            return sorted;
        });
    }

    async function handleAddEntity() {
        const entity = get(newEntity);
        if (entity.weight < 0 || entity.weight > 1) {
            message.set('Weight must be between 0 and 1');
            return;
        }
        try {
            await addEntity(documentId, entity);
            await loadEntities();
            newEntity.set({ text: '', type: '', weight: 0 });
            indicateSave();
            message.set('Entity added successfully');
        } catch (error) {
            message.set('Error adding entity');
        }
    }

    async function handleUpdateEntity(updatedEntity: any, inputElement: HTMLInputElement) {
        if (updatedEntity.weight < 0 || updatedEntity.weight > 1) {
            message.set('Weight must be between 0 and 1');
            return;
        }
        try {
            await updateEntity(documentId, updatedEntity);
            await loadEntities();
            indicateInputSave(inputElement);
            message.set('Entity updated successfully');
        } catch (error) {
            message.set('Error updating entity');
        }
    }

    async function handleDeleteEntity(id: number) {
        try {
            await deleteEntity(documentId, id);
            await loadEntities();
            message.set('Entity deleted successfully');
        } catch (error) {
            message.set('Error deleting entity');
        }
    }

    function indicateSave() {
        saveIndicator.set(true);
        setTimeout(() => {
            saveIndicator.set(false);
        }, 2000);
    }

    function indicateInputSave(inputElement: HTMLInputElement) {
        inputElement.classList.add('input-updated');
        setTimeout(() => {
            inputElement.classList.remove('input-updated');
        }, 2000);
    }
</script>

<div>
    <h3 class:save-indicator={$saveIndicator}>Entities for {documentId}</h3>
    <table class="entities-table">
        <thead>
            <tr>
                <th on:click={() => sortTable('text')}>Text</th>
                <th on:click={() => sortTable('type')}>Type</th>
                <th on:click={() => sortTable('weight')}>Weight</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each $sortedEntities as entity, i}
                <tr>
                    <td><input type="text" bind:value={entity.text} on:change={(e) => handleUpdateEntity(entity, e.currentTarget)} /></td>
                    <td><input type="text" bind:value={entity.type} on:change={(e) => handleUpdateEntity(entity, e.currentTarget)} /></td>
                    <td><input type="number" bind:value={entity.weight} min="0" max="1" step="0.01" on:change={(e) => handleUpdateEntity(entity, e.currentTarget)} /></td>
                    <td><button on:click={() => handleDeleteEntity(entity.id)}>Delete</button></td>
                </tr>
            {/each}
        </tbody>
    </table>

    <div class="add-entity-container">
        <label>
            Text:
            <input type="text" placeholder="Text" bind:value={$newEntity.text} />
        </label>
        <label>
            Type:
            <input type="text" placeholder="Type" bind:value={$newEntity.type} />
        </label>
        <label>
            Weight:
            <input type="number" placeholder="Weight" bind:value={$newEntity.weight} min="0" max="1" step="0.01" />
        </label>
        <button on:click={handleAddEntity}>Add Entity</button>
    </div>
    <Toast {message} />
</div>

<style lang="scss">
  @import './EntityList.scss';
</style>
