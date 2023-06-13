import * as vscode from "vscode";
import { GitProcess } from "../git";

export class IteratorItem extends vscode.TreeItem {
	static sort = (arr: string[]) => {
		return [...arr].sort((a, b) => b.localeCompare(a));
	};
	constructor(public readonly branch: string, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
		const { version, uuid } = GitProcess.parse(branch);
		const label = `迭代 ${version}` + (uuid ? `[${uuid}]` : "");
		super(label, collapsibleState);
		this.label = label;
		this.tooltip = this.label;
	}

	iconPath = new vscode.ThemeIcon("symbol-constant");
	contextValue?: string | undefined = "release";
}
