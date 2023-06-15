import * as vscode from "vscode";
import git from "./git";
import { BranchItem } from "./treeItem/branch";
import { ProjectItem } from "./treeItem/project";
import { IteratorItem } from "./treeItem/iterator";

export class DevopsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string) {}
	refresh() {
		this._onDidChangeTreeData.fire(undefined);
	}
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
			return Promise.all([git.getTests(element.branch), git.getHotfixs(element.branch)]).then(([tests, hotfixs]) => {
				return BranchItem.sort(tests)
					.map((i) => new BranchItem(i, vscode.TreeItemCollapsibleState.Collapsed))
					.concat(BranchItem.sort(hotfixs).map((i) => new BranchItem(i, vscode.TreeItemCollapsibleState.None)));
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
