import { ItemView, WorkspaceLeaf } from 'obsidian';
import Component from './SideBar.svelte';

export class Sidebar extends ItemView {
    component: Component;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return 'my-sidebar';
    }

    getDisplayText(): string {
        return 'My Sidebar';
    }

    getIcon(): string {
        return 'textSightIcon';
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