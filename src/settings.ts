import { App, Platform, PluginSettingTab, Setting } from "obsidian";
import type OpenInTerminalPlugin from "./main";

export type PlatformKey = "darwin" | "win32" | "linux";

export interface OpenInTerminalSettings {
	macApp: string;
	windowsApp: string;
	linuxApp: string;
}

export const DEFAULT_SETTINGS: OpenInTerminalSettings = {
	macApp: "Terminal",
	windowsApp: "wt",
	linuxApp: "gnome-terminal",
};

export function getPlatform(): PlatformKey {
	if (Platform.isWin) {
		return "win32";
	}

	if (Platform.isLinux) {
		return "linux";
	}

	return "darwin";
}

export function getTerminalApp(settings: OpenInTerminalSettings): string {
	switch (getPlatform()) {
		case "darwin":
			return settings.macApp;
		case "win32":
			return settings.windowsApp;
		case "linux":
			return settings.linuxApp;
	}
}

function setTerminalApp(settings: OpenInTerminalSettings, value: string) {
	const next = value.trim() || getDefaultTerminal();

	switch (getPlatform()) {
		case "darwin":
			settings.macApp = next;
			return;
		case "win32":
			settings.windowsApp = next;
			return;
		case "linux":
			settings.linuxApp = next;
			return;
	}
}

function getDefaultTerminal(): string {
	switch (getPlatform()) {
		case "darwin":
			return DEFAULT_SETTINGS.macApp;
		case "win32":
			return DEFAULT_SETTINGS.windowsApp;
		case "linux":
			return DEFAULT_SETTINGS.linuxApp;
	}
}

function getPlatformLabel(): string {
	switch (getPlatform()) {
		case "darwin":
			return "macOS";
		case "win32":
			return "Windows";
		case "linux":
			return "Linux";
	}
}

function getTerminalHint(): string {
	switch (getPlatform()) {
		case "darwin":
			return "Use an app name like Terminal or iTerm.";
		case "win32":
			return "Use a command like wt, powershell.exe, or cmd.exe.";
		case "linux":
			return "Use a command like gnome-terminal, konsole, or xterm.";
	}
}

export class OpenInTerminalSettingTab extends PluginSettingTab {
	plugin: OpenInTerminalPlugin;

	constructor(app: App, plugin: OpenInTerminalPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName(`Open in Terminal: ${getPlatformLabel()} Settings`)
			.setHeading();

		new Setting(containerEl)
			.setName("Terminal app")
			.setDesc(getTerminalHint())
			.addText((text) =>
				text
					.setPlaceholder(getDefaultTerminal())
					.setValue(getTerminalApp(this.plugin.settings))
					.onChange(async (value) => {
						setTerminalApp(this.plugin.settings, value);
						await this.plugin.saveSettings();
					}),
			);
	}
}
