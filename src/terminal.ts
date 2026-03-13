import { spawn } from "child_process";
import { FileSystemAdapter, TAbstractFile, TFile, TFolder } from "obsidian";
import { getPlatform } from "./settings";

type LaunchSpec = {
	command: string;
	args: string[];
	cwd: string;
};

export function resolveTargetDir(
	adapter: FileSystemAdapter,
	file: TAbstractFile,
): string {
	if (file instanceof TFolder) {
		return file.path ? adapter.getFullPath(file.path) : adapter.getBasePath();
	}

	if (file instanceof TFile) {
		return file.parent?.path
			? adapter.getFullPath(file.parent.path)
			: adapter.getBasePath();
	}

	return adapter.getBasePath();
}

export function openTerminal(
	app: string,
	dir: string,
	onError: (error: Error) => void,
) {
	const spec = getLaunchSpec(app, dir);
	const child = spawn(spec.command, spec.args, {
		cwd: spec.cwd,
		detached: true,
		stdio: "ignore",
	});

	child.once("error", onError);
	child.unref();
}

function getLaunchSpec(app: string, dir: string): LaunchSpec {
	switch (getPlatform()) {
		case "darwin":
			return {
				command: "open",
				args: ["-a", app, dir],
				cwd: dir,
			};
		case "win32":
			return {
				command: app,
				args: /^wt(?:\.exe)?$/i.test(app) ? ["-d", dir] : [],
				cwd: dir,
			};
		case "linux":
			return getLinuxSpec(app, dir);
	}
}

function getLinuxSpec(app: string, dir: string): LaunchSpec {
	const key = app.toLowerCase();

	if (key === "gnome-terminal") {
		return {
			command: app,
			args: [`--working-directory=${dir}`],
			cwd: dir,
		};
	}

	if (key === "konsole") {
		return {
			command: app,
			args: ["--workdir", dir],
			cwd: dir,
		};
	}

	return {
		command: app,
		args: [],
		cwd: dir,
	};
}
