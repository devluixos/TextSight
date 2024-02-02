import { Plugin } from 'obsidian';

export default class TextSight extends Plugin {
	statusBarElement: HTMLSpanElement;

	async onload() {
		console.log('TextSight master thesis from Luiz Perren');
		this.statusBarElement = this.addStatusBarItem().createEl('span');
		this.readActiveFileAndUpdateLineCounter();

		this.app.workspace.on('active-leaf-change', async () => {
			this.readActiveFileAndUpdateLineCounter();
		});

		this.app.workspace.on('editor-change', editor => {
			const content = editor.getDoc().getValue();
			this.updateLineCount(content);
		})
	}

	private updateLineCount(fileContent?: string) {
		const count = fileContent ? fileContent.split(/\r\n|\r|\n/).length : 0;
		const lineWords = count === 1 ? "line" : "lines";
		this.statusBarElement.textContent = `${count} ${lineWords}`;
	}

	private async readActiveFileAndUpdateLineCounter() {
		const file = this.app.workspace.getActiveFile();
			if(file) {
				const content = await this.app.vault.read(file);
				console.log(content);
			} else {
				this.updateLineCount(undefined);
			}
	}
}