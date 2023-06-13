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

	private syncing = false;
	public sync = () => {
		if (this.syncing) {
			return Promise.resolve();
		}
		return new Promise<void>((resolve, reject) => {
			this.syncing = true;
			this.git?.fetch(["--all"], (err) => {
				this.syncing = false;
				if (err) {
					return reject(err);
				}
				return resolve();
			});
		});
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
		const res = all.reduce((acc, cur) => {
			const obj = GitProcess.parse(cur);
			if (obj.project === project && obj.action === "release") {
				acc.add(cur.replace(GitProcess.remotePrefix, ""));
			}
			return acc;
		}, new Set<string>());
		return Array.from(res);
	};

	public getTests = async (branch: string) => {
		const { all } = await this.getAllBranches();
		const { project, version, uuid } = GitProcess.parse(branch);
		const res = all.reduce((acc, cur) => {
			const obj = GitProcess.parse(cur);
			if (obj.project === project && obj.version === version && obj.action === "test") {
				if (!uuid || obj.uuid === uuid) {
					acc.add(cur.replace(GitProcess.remotePrefix, ""));
				}
			}
			return acc;
		}, new Set<string>());
		return Array.from(res);
	};

	public getDev = async (branch: string) => {
		const { all } = await this.getAllBranches();
		const { project, version, uuid } = GitProcess.parse(branch);
		const res = all.reduce((acc, cur) => {
			const obj = GitProcess.parse(cur);
			if (obj.project === project && obj.version === version && obj.action === "feat") {
				if (!uuid || obj.uuid.startsWith(uuid)) {
					acc.add(cur.replace(GitProcess.remotePrefix, ""));
				}
			}
			return acc;
		}, new Set<string>());
		return Array.from(res);
	};

	public createBranch = async (basis: string, next: string) => {
		return new Promise<void>((resolve, reject) => {
			this.git!.checkoutBranch(next, `${GitProcess.remotePrefix}${basis}`, (err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	};
}

export default new GitProcess();
