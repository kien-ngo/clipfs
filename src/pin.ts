// Require IPFS daemon to be running
import { exec } from "node:child_process";
import util from "node:util";

const execAsync = util.promisify(exec);

async function pinCID(cid: string, label?: string, showProgress = true) {
	try {
		const progressFlag = showProgress ? "--progress" : "";
		const pinCmd = `ipfs pin add ${progressFlag} ${cid}`;
		if (!label) {
			const { stdout } = await execAsync(pinCmd);
			console.log(stdout.trim());
		} else {
			const cmd1 = `$(${pinCmd} | cut -f 2 -d ' ')`;
			const cmd = `ipfs files cp /ipfs/${cmd1} /"${label}"`;
			const { stdout } = await execAsync(cmd);
			console.log(stdout.trim());
			console.log(`Pinned [${cid}] with label: [${label}]`);
		}
	} catch (error) {
		console.error("Error:", error);
	}
}

function parseArgs() {
	const args = process.argv.slice(2);
	const options: { cid?: string; label?: string; progress: boolean } = {
		progress: true,
	};

	for (const arg of args) {
		if (arg.startsWith("--cid=")) options.cid = arg.split("=")[1];
		else if (arg.startsWith("--label=")) options.label = arg.split("=")[1];
		else if (arg.startsWith("--progress="))
			options.progress = arg.split("=")[1] !== "false";
	}

	return options;
}

async function main() {
	const { cid, label, progress } = parseArgs();

	if (!cid) {
		console.error("Error: --cid is required.");
		process.exit(1);
	}

	await pinCID(cid, label, progress);
}

main().catch(console.error);
