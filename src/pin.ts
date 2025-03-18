// Require IPFS daemon to be running

async function pinCID(cid: string, label?: string, showProgress = true) {
	try {
		const progressFlag = showProgress ? "--progress" : "";
		if (!label) {
			const args = ["ipfs", "pin", "add"];
			if (progressFlag) args.push(progressFlag);
			args.push(cid);
			const proc = Bun.spawn(args, { stdout: "pipe" });
			const stdout = await new Response(proc.stdout).text();
			console.log(stdout.trim());
		} else {
			// For complex operations with pipes, we'll use bash
			const pinCmd = `ipfs pin add ${progressFlag} ${cid}`;
			const cmd = `${pinCmd} | cut -f 2 -d ' ' | xargs -I {} ipfs files cp /ipfs/{} /"${label}"`;
			const proc = Bun.spawn(["bash", "-c", cmd], { stdout: "pipe" });
			const stdout = await new Response(proc.stdout).text();
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
