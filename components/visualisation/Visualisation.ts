// Visualization.ts
import { ItemView, WorkspaceLeaf } from 'obsidian';
import Test from './SceneWrapper.svelte';

export class Visualisation extends ItemView {
    test: Test;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return 'my-visualisation';
    }

    getDisplayText(): string {
        return 'TextSight';
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