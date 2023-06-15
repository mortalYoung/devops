import * as vscode from "vscode";
import { GitProcess } from "../git";

export class BranchItem extends vscode.TreeItem {
	static sort = (arr: string[]) => {
		const res: [string[], string[]] = [[], []];
		for (let index = 0; index < arr.length; index++) {
			const item = arr[index];
			const tmp = GitProcess.parse(item);
			if (!tmp.uuid || tmp.uuid === "dev") {
				res[0].push(item);
			} else {
				res[1].push(item);
			}
		}
		res[0].sort();
		res[1].sort();
		return res.flat();
	};
	constructor(public readonly label: string, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
		super(label, collapsibleState);
		this.label = label;
		this.tooltip = this.label;
		const obj = GitProcess.parse(this.label);
		this.contextValue = (() => {
			if (obj.action === "test") {
				return "test";
			}
			if (obj.action === "feat") {
				return "dev";
			}
			if (obj.action === "hotfix") {
				return "hotfix";
			}
		})();

		this.description = (() => {
			if (obj.action === "test") {
				if (!obj.uuid) {
					return "【默认】";
				}
				return "";
			}
			if (obj.action === "feat") {
				if (obj.uuid === "dev") {
					return "【默认】";
				}
				return "";
			}
		})();

		this.iconPath = (() => {
			if (obj.action === "test") {
				return new vscode.ThemeIcon("symbol-class");
			}

			if (obj.action === "feat") {
				return new vscode.ThemeIcon("symbol-method");
			}

			if (obj.action === "hotfix") {
				return new vscode.ThemeIcon("symbol-property");
			}
		})();
	}
}
