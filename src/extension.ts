// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { DevopsProvider } from "./devopsProvider";
import * as commands from "./commands";
import git from "./git";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const rootPath =
		vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
			? vscode.workspace.workspaceFolders[0].uri.fsPath
			: undefined;
	if (!rootPath) return;

	git.init(rootPath);

	const devopsProvider = new DevopsProvider(rootPath);
	vscode.window.registerTreeDataProvider("dtstack.devops", devopsProvider);

	// Register all commands
	context.subscriptions.push(...Object.values(commands).map((dispose) => dispose));
}

// This method is called when your extension is deactivated
export function deactivate() {}
