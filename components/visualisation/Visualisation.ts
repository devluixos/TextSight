// Visualization.ts
import { ItemView, WorkspaceLeaf } from 'obsidian';
import Component from './Visualisation.svelte';
import Test from './Scene.svelte';

export class Visualisation extends ItemView {
    test: Test;

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
        this.test = new Test({
            target: this.contentEl,
        });
    }

    async onClose() {
        this.test.$destroy();
    }
}