import * as vscode from "vscode";
import git from "./git";
import { BranchItem } from "./treeItem/branch";
import { ProjectItem } from "./treeItem/project";
import { IteratorItem } from "./treeItem/iterator";

export class DevopsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	constructor(private workspaceRoot: string) {}
	getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
		if (!this.workspaceRoot) {
			return Promise.resolve([]);
		}

		if (!element) {
			return git.getProjects().then((projects) => {
				return ProjectItem.sort(projects).map((p) => new ProjectItem(p, vscode.TreeItemCollapsibleState.Collapsed));
			});
		}

		if (element instanceof ProjectItem) {
			return git.getIterators(element.label).then((iterators) => {
				return IteratorItem.sort(iterators).map((i) => new IteratorItem(i, vscode.TreeItemCollapsibleState.Collapsed));
			});
		}

		if (element instanceof IteratorItem) {
			return git.getTests(element.branch).then((tests) => {
				return BranchItem.sort(tests).map((i) => new BranchItem(i, vscode.TreeItemCollapsibleState.Collapsed));
			});
		}

		if (element instanceof BranchItem) {
			return git.getDev(element.label).then((devs) => {
				return BranchItem.sort(devs).map((i) => new BranchItem(i, vscode.TreeItemCollapsibleState.None));
			});
		}

		return Promise.resolve([]);
	}
}
