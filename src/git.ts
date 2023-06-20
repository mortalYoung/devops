import { type SimpleGit, simpleGit } from "simple-git";

export class GitProcess {
	private git: SimpleGit | undefined;
	static remotePrefix = "remotes/origin/";
	static parse = (branch: string = "") => {
		const obj = {
			project: "",
			branch,
			version: "",
			action: "",
			uuid: "",
		};

		const [project, rest = ""] = branch.replace(GitProcess.remotePrefix, "").split("/");
		obj.project = project;
		const [action, version, ...uuid] = rest.split("_");
		obj.action = action;
		obj.version = version;
		obj.uuid = uuid.join("_");
		return obj;
	};

	constructor() {}

	private getAllBranches = async () => await this.git!.branch();

	/**
	 * ONLY get ORIGIN remote
	 */
	public getRemote = async () => {
		const remote = (await this.git!.remote(["-v"]))
			?.split("\n")
			.filter(Boolean)
			.find((i) => i.startsWith("origin") && i.endsWith("(push)"))
			?.replace(/(origin\t)|(\(push\))/g, "")
			.trim();
		const isSSh = remote?.startsWith("ssh://");
		if (isSSh) {
			const parseUrl = await import("parse-path");
			const url = parseUrl(remote!);
			return `http://${url.resource}${url.pathname.replace(".git", "")}/merge_requests`;
		} else {
			return remote?.replace(".git", "") + "/merge_requests";
		}
	};

	private syncing = false;
	public sync = async () => {
		if (this.syncing) {
			return Promise.reject(new Error("Still syncing"));
		}
		try {
			this.syncing = true;
			await this.git?.raw(["remote", "prune", "origin"]);
			await this.git?.fetch(["--all"]);
			this.syncing = false;
			return Promise.resolve();
		} catch (error) {
			this.syncing = false;
			return Promise.reject(error);
		}
	};

	public init = (rootPath: string) => {
		this.git = simpleGit({
			baseDir: rootPath,
			binary: "git",
			trimmed: true,
		});
	};

	public getProjects = async () => {
		const { all } = await this.getAllBranches();
		const res = all.reduce((acc, cur) => {
			const { project } = GitProcess.parse(cur);
			acc.add(project);
			return acc;
		}, new Set<string>());

		return Array.from(res);
	};

	public getIterators = async (project: string) => {
		const { all } = await this.getAllBranches();
		const regex = new RegExp(`${GitProcess.remotePrefix}${project}/release_`);
		const res = all.reduce((acc, cur) => {
			if (regex.test(cur)) {
				acc.add(cur.replace(GitProcess.remotePrefix, ""));
			}
			return acc;
		}, new Set<string>());
		return Array.from(res);
	};

	public getTests = async (branch: string) => {
		const { all } = await this.getAllBranches();
		const { project, version, uuid } = GitProcess.parse(branch);
		const regex = new RegExp(`${GitProcess.remotePrefix}${project}/test_${version}` + (uuid ? `_${uuid}` : ""));
		const res = all.reduce((acc, cur) => {
			if (regex.test(cur)) {
				acc.add(cur.replace(GitProcess.remotePrefix, ""));
			}
			return acc;
		}, new Set<string>());
		return Array.from(res);
	};

	public getHotfixs = async (branch: string) => {
		const { all } = await this.getAllBranches();
		const { project, version, uuid } = GitProcess.parse(branch);
		const regex = new RegExp(`${GitProcess.remotePrefix}${project}/hotfix_${version}` + (uuid ? `_${uuid}` : ""));
		const res = all.reduce((acc, cur) => {
			if (regex.test(cur)) {
				acc.add(cur.replace(GitProcess.remotePrefix, ""));
			}
			return acc;
		}, new Set<string>());
		return Array.from(res);
	};

	public getDev = async (branch: string) => {
		const { all } = await this.getAllBranches();
		const current = GitProcess.parse(branch);
		const branchPrefix = `${GitProcess.remotePrefix}${current.project}/feat_${current.version}_` + (current.uuid ? `${current.uuid}_` : "");
		const res = all.reduce((acc, cur) => {
			if (cur.startsWith(branchPrefix)) {
				acc.add(cur.replace(GitProcess.remotePrefix, ""));
			}
			return acc;
		}, new Set<string>());
		return Array.from(res);
	};

	public getFix = async (branch: string) => {
		const { all } = await this.getAllBranches();
		const current = GitProcess.parse(branch);
		const branchPrefix = `${GitProcess.remotePrefix}${current.project}/fix_${current.version}_` + (current.uuid ? `${current.uuid}_` : "");
		const res = all.reduce((acc, cur) => {
			if (cur.startsWith(branchPrefix)) {
				acc.add(cur.replace(GitProcess.remotePrefix, ""));
			}
			return acc;
		}, new Set<string>());
		return Array.from(res);
	};

	public getUntrackedBranch = async () => {
		// [TODO)
		return [];
	};

	public createBranch = async (basis: string, next: string) => {
		try {
			await this.git!.checkoutBranch(next, `${GitProcess.remotePrefix}${basis}`);
			await this.git?.push("origin", next, ["-u"]);
			return Promise.resolve();
		} catch (error) {
			return Promise.reject(error);
		}
	};
}

export default new GitProcess();
