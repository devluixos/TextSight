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
        return 'document';
    }

    async onOpen() {
        this.component = new Component({
            target: this.contentEl,
        });
        /*
        this.containerEl.addClass('my-sidebar');
        // Title
        const title = document.createElement('h2');
        title.textContent = 'Analysis Tools';
        this.containerEl.appendChild(title);

        // Line Separator
        const separator = document.createElement('hr');
        this.containerEl.appendChild(separator);

        // Subtitle
        const subtitle = document.createElement('h3');
        subtitle.textContent = 'Text Analysis';
        this.containerEl.appendChild(subtitle);

        // Dynamic Search - Implement functionality to search and list documents

        // Analysis Button
        const analyseButton = document.createElement('button');
        analyseButton.textContent = 'Analyse';
        // Add click event listener for analysis functionality
        this.containerEl.appendChild(analyseButton);

        // Label for displaying selected document or analysis status
        const statusLabel = document.createElement('p');
        statusLabel.textContent = 'Select a document to analyze';
        this.containerEl.appendChild(statusLabel);
        */
    }

    async onClose() {
        this.component.$destroy();
    }
    
}