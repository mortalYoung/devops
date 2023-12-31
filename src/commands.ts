import * as vscode from "vscode";
import git, { GitProcess } from "./git";
import { BranchItem } from "./treeItem/branch";
import { IteratorItem } from "./treeItem/iterator";
import type { DevopsProvider } from "./devopsProvider";

/**
 * 同步仓库
 */
export const onRefresh = (provider: DevopsProvider) =>
	vscode.commands.registerCommand("dtstack-devops.refresh", () => {
		const dispose = vscode.window.setStatusBarMessage("$(sync~spin)Deveop 仓库同步中，请稍等...");
		git.sync()
			.then(() => {
				provider.refresh();
			})
			.catch((error: Error) => {
				vscode.window.showErrorMessage(error.message);
			})
			.finally(() => {
				dispose.dispose();
			});
	});

/**
 * 新建开发分支
 */
export const onCreateDev = () =>
	vscode.commands.registerCommand("dtstack-devops.onCreateDev", (branchItem: BranchItem) => {
		const obj = GitProcess.parse(branchItem.label);
		vscode.window
			.showInputBox({
				title: "Create Develop Branch",
				placeHolder: "Input an valid Develop Branch",
				value: `${obj.project}/${obj.action}_${obj.version}_`,
				validateInput(value) {
					if (!value) {
						return "非空";
					}
				},
			})
			.then((value) => {
				if (value) {
					git.createBranch(branchItem.label, value)
						.then(() => {
							vscode.window.showInformationMessage(`Switch to ${value}`);
							vscode.commands.executeCommand("dtstack-devops.refresh");
						})
						.catch((err: Error) => {
							vscode.window.showErrorMessage(err.message);
						});
				}
			});
	});

/**
 * 新建开发总分支
 */
export const onCreateDevBus = () =>
	vscode.commands.registerCommand("dtstack-devops.onCreateDevBus", (branchItem: BranchItem) => {
		const obj = GitProcess.parse(branchItem.label);
		const branch = `${obj.project}/feat_${obj.version}_dev`;
		vscode.window
			.showInputBox({
				title: "Create Develop Branch",
				placeHolder: "Input an valid Develop Branch",
				value: branch,
				validateInput(value) {
					if (!value) {
						return "非空";
					}
				},
			})
			.then((value) => {
				if (value) {
					git.createBranch(branchItem.label, value!)
						.then(() => {
							vscode.window.showInformationMessage(`Switch to ${branch}`);
							vscode.commands.executeCommand("dtstack-devops.refresh");
						})
						.catch((err: Error) => {
							vscode.window.showErrorMessage(err.message);
						});
				}
			});
	});

/**
 * 创建修复分支
 */
export const onCreateFix = () =>
	vscode.commands.registerCommand("dtstack-devops.onCreateFix", (branchItem: BranchItem) => {
		const obj = GitProcess.parse(branchItem.label);
		vscode.window
			.showInputBox({
				title: "Input zenpms",
				placeHolder: "http://",
				validateInput(val) {
					if (!val) {
						return "非空";
					}
					const match = val.startsWith("http://") ? /(bug-view-)(.+)(.html)/.test(val) : !Number.isNaN(Number(val));

					if (!match) {
						return "禅道 id 格式不正确";
					}
				},
			})
			.then((val) => {
				if (val) {
					const zenpmsId = val!.startsWith("http://") ? val?.match(/(bug-view-)(.+)(.html)/)?.[2] : Number(val);
					if (!zenpmsId) {
						vscode.window.showErrorMessage(`${val} 好像解析失败了，正则匹配失败`);
						return;
					}
					const branch = `${obj.project}/fix_${obj.version}_${zenpmsId}`;
					git.createBranch(branchItem.label, branch)
						.then(() => {
							vscode.window.showInformationMessage(`Switch to ${branch}`);
							vscode.commands.executeCommand("dtstack-devops.refresh");
						})
						.catch((err: Error) => {
							vscode.window.showErrorMessage(err.message);
						});
				}
			});
	});

/**
 * 创建提测分支
 */
export const onCreateTest = () =>
	vscode.commands.registerCommand("dtstack-devops.onCreateTest", (iterator: IteratorItem) => {
		const obj = GitProcess.parse(iterator.branch);
		const branch = `${obj.project}/test_${obj.version}`;
		vscode.window
			.showInputBox({
				title: "Create Test Branch",
				placeHolder: "Input an valid Test Branch",
				value: branch,
				validateInput(value) {
					if (!value) {
						return "非空";
					}
				},
			})
			.then((value) => {
				if (value) {
					git.createBranch(iterator.branch, value!)
						.then(() => {
							vscode.window.showInformationMessage(`Switch to ${branch}`);
							vscode.commands.executeCommand("dtstack-devops.refresh");
						})
						.catch((err: Error) => {
							vscode.window.showErrorMessage(err.message);
						});
				}
			});
	});

/**
 * 创建 hotfix 分支
 */
export const onCreateHotfix = () =>
	vscode.commands.registerCommand("dtstack-devops.onCreateHotfix", (iterator: IteratorItem) => {
		const obj = GitProcess.parse(iterator.branch);
		vscode.window
			.showInputBox({
				title: "Input zenpms",
				placeHolder: "http://",
				validateInput(val) {
					if (!val) {
						return "非空";
					}
					const match = val.startsWith("http://") ? /(bug-view-)(.+)(.html)/.test(val) : !Number.isNaN(Number(val));

					if (!match) {
						return "禅道 id 格式不正确";
					}
				},
			})
			.then((val) => {
				if (val) {
					const zenpmsId = val!.startsWith("http://") ? val?.match(/(bug-view-)(.+)(.html)/)?.[2] : Number(val);
					if (!zenpmsId) {
						vscode.window.showErrorMessage(`${val} 好像解析失败了，正则匹配失败`);
						return;
					}
					const branch = `${obj.project}/hotfix_${obj.version}_${val}`;
					git.createBranch(iterator.branch, branch)
						.then(() => {
							vscode.window.showInformationMessage(`Switch to ${branch}`);
							vscode.commands.executeCommand("dtstack-devops.refresh");
						})
						.catch((err: Error) => {
							vscode.window.showErrorMessage(err.message);
						});
				}
			});
	});

/**
 * 创建迭代
 */
export const onCreateIterator = () =>
	vscode.commands.registerCommand("dtstack-devops.onCreateIterator", () => {
		vscode.window.showInformationMessage("TODO，没实现");
	});

export const onCreateMR = () =>
	vscode.commands.registerCommand("dtstack-devops.onCreateMR", (branchItem: BranchItem) => {
		const obj = GitProcess.parse(branchItem.label);
		const isFix = obj.action === "fix";
		const isDevBus = obj.uuid === "dev";
		const isMergeToTest = isFix || isDevBus;
		git.getRemote().then((url) => {
			vscode.window
				.showInputBox({
					title: "Copy the url and open it in browser",
					value: `${url}/new?merge_request%5Bsource_branch%5D=${encodeURIComponent(
						branchItem.label,
					)}&merge_request%5Btarget_branch%5D=${encodeURIComponent(
						isMergeToTest ? `${obj.project}/test_${obj.version}` : `${obj.project}/feat_${obj.version}_dev`,
					)}`,
					validateInput(value) {
						if (!value) {
							return "非空";
						}
					},
				})
				.then((val) => {
					if (val) {
						vscode.env.openExternal(vscode.Uri.parse(val!));
					}
				});
		});
	});
