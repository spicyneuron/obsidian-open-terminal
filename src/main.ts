import {
	FileSystemAdapter,
	Notice,
	Platform,
	Plugin,
	TAbstractFile,
	TFile,
	TFolder,
} from "obsidian";
import {
	DEFAULT_SETTINGS,
	OpenInTerminalSettingTab,
	getTerminalApp,
	type OpenInTerminalSettings,
} from "./settings";
import { openTerminal, resolveTargetDir } from "./terminal";

export default class OpenInTerminalPlugin extends Plugin {
	settings: OpenInTerminalSettings = DEFAULT_SETTINGS;

	async onload() {
		if (!Platform.isDesktopApp) {
			return;
		}

		await this.loadSettings();
		this.addSettingTab(new OpenInTerminalSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile || file instanceof TFolder)) {
					return;
				}

				menu.addItem((item) =>
					item
						.setTitle("Open in terminal")
						.setIcon("terminal")
						.onClick(() => this.openForFile(file)),
				);
			}),
		);
	}

	async loadSettings() {
		const saved = (await this.loadData()) as Partial<OpenInTerminalSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private openForFile(file: TAbstractFile) {
		const adapter = this.app.vault.adapter;
		if (!(adapter instanceof FileSystemAdapter)) {
			new Notice("Open in terminal only works with local vaults.");
			return;
		}

		const terminalApp = getTerminalApp(this.settings).trim();
		if (!terminalApp) {
			new Notice("Set a terminal app in the plugin settings.");
			return;
		}

		const dir = resolveTargetDir(adapter, file);

		openTerminal(terminalApp, dir, (error) => {
			console.error("Open in terminal failed", error);
			new Notice(`Could not open "${terminalApp}". Check the plugin settings.`);
		});
	}
}
