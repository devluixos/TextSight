// Visualization.ts
import { ItemView, WorkspaceLeaf } from 'obsidian';
import Component from './Visualisation.svelte';

export class Visualisation extends ItemView {
    component: Component;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return 'my-visualisation';
    }

    getDisplayText(): string {
        return 'My Visualisation';
    }

    getIcon(): string {
        return 'document';
    }

    async onOpen() {
        this.component = new Component({
            target: this.contentEl,
        });
    }

    async onClose() {
        this.component.$destroy();
    }
}