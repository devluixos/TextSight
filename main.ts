import { ItemView, WorkspaceLeaf, Plugin } from 'obsidian';
import { StatusBar } from './components/statusbar/StatusBar';
import { Sidebar } from './components/sidebar/SideBar';
import { initializeDatabase } from './sqlite/sqlHandler';

export default class MyPlugin extends Plugin {
	private statusBarComponent: StatusBar;
    statusBar: HTMLElement;

    async onload() {
        this.registerView('my-sidebar', (leaf: WorkspaceLeaf) => new Sidebar(leaf));
		this.statusBarComponent = new StatusBar(this);
        initializeDatabase();    
    }

	navigateToSidebar() {
		const leaves = this.app.workspace.getLeavesOfType('my-sidebar');
		if (leaves.length > 0) {
			this.app.workspace.setActiveLeaf(leaves[0]);
		} else {
			this.addSidebar();
		}
	}

    addSidebar() {
        if (this.app.workspace.getLeavesOfType('sidebar').length) {
            return;
        }
        this.app.workspace.getRightLeaf(false).setViewState({
            type: 'my-sidebar',
            active: true,
        });
    }

    onunload() {
        this.statusBar.remove();
    }
}