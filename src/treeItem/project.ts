import * as vscode from "vscode";
import { GitProcess } from "../git";

export class ProjectItem extends vscode.TreeItem {
	static pList = ["easyIndex", "tag", "uic", "valid", "stream", "dataLake", "dataAssets", "dataApi", "console", "publicService"];
	static sort = (arr: string[]) => {
		const res: [string[], string[]] = [[], []];
		for (let index = 0; index < arr.length; index++) {
			const item = arr[index];
			const { project } = GitProcess.parse(item);
			if (ProjectItem.pList.includes(project)) {
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
		this.tooltip = this.label;

		this.description = `[${(() => {
			switch (this.label) {
				case "easyIndex":
					return "指标";
				case "tag":
					return "标签";
				case "batch":
					return "离线";
				case "uic":
					return "uic";
				case "portal":
					return "portal";
				case "console":
					return "控制台";
				default:
					return "其他";
			}
		})()}]`;
	}

	iconPath = vscode.ThemeIcon.Folder;
	contextValue?: string | undefined = 'project';
}
