// StatusBar.ts
import { Plugin } from 'obsidian';
import { Sidebar } from '../sidebar/SideBar';


export class StatusBar {
    statusBarElement: HTMLElement;
    private plugin: Plugin;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.createStatusBar();
    }

    private createStatusBar() {
        this.statusBarElement = this.plugin.addStatusBarItem();
        this.statusBarElement.textContent = 'TextSight';
        // Bind the click event directly to the navigation function
        this.statusBarElement.addEventListener('click', () => this.navigateToSidebar());
    }

    private navigateToSidebar() {
      // Check if a sidebar of type 'sidebar' already exists
      const leaves = this.plugin.app.workspace.getLeavesOfType('my-sidebar');
      if (leaves.length > 0) {
        // If exists, focus on it
        this.plugin.app.workspace.setActiveLeaf(leaves[0], { focus: false }); // false to not focus in edit mode
      } else {
        // If not, add a new sidebar
        this.addSidebar();
      }
    }

    private addSidebar() {
        // Ensure no sidebar of the same type is already open
        if (this.plugin.app.workspace.getLeavesOfType('sidebar').length === 0) {
            this.plugin.app.workspace.getRightLeaf(false).setViewState({
                type: 'my-sidebar',
                active: true,
            }).then(() => {
                // Focus on the new sidebar if needed
                const newLeaf = this.plugin.app.workspace.getLeavesOfType('my-sidebar')[0];
                if (newLeaf) {
                    this.plugin.app.workspace.setActiveLeaf(newLeaf, { focus: false }); // false to not focus in edit mode
                }
            });
        }
    }

    remove() {
        this.statusBarElement.remove();
    }
}
