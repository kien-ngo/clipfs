import { exec } from "node:child_process";
import util from "node:util";
import Table from "cli-table3";

const execAsync = util.promisify(exec);

async function listFiles(): Promise<string[]> {
	const { stdout } = await execAsync("ipfs files ls /");
	return stdout.trim().split("\n");
}

async function getFileStat(path: string) {
	const { stdout } = await execAsync(`ipfs files stat /"${path}"`);
	const lines = stdout.trim().split("\n");
	const cid = lines[0];
	const size = Number.parseInt(
		lines.find((line) => line.startsWith("Size:"))?.split(": ")[1] || "0",
		10,
	);
	const cumulativeSize = Number.parseInt(
		lines.find((line) => line.startsWith("CumulativeSize:"))?.split(": ")[1] ||
			"0",
		10,
	);
	const type =
		lines
			.find((line) => line.startsWith("Type:"))
			?.split(": ")[1]
			?.trim() || "unknown";

	return {
		cid,
		size: type === "directory" ? cumulativeSize : size,
		type,
	};
}

function formatSize(bytes: number): string {
	return `${(bytes / 1024 ** 3).toFixed(4)} GB`;
}

async function main() {
	const args = process.argv.slice(2);
	const enhanced = args.includes("--enhanced") || args.includes("-E");
	const files = await listFiles();
	if (enhanced) {
		const table = new Table({ head: ["CID", "Size", "Type"] });
		for (const file of files) {
			try {
				const { cid, size, type } = await getFileStat(file);
				table.push([cid, formatSize(size), type]);
			} catch (error) {
				console.error(`Error fetching data for ${file}:`, error);
			}
		}
		console.log(table.toString());
	} else {
		for (const file of files) {
			try {
				const { cid, size, type } = await getFileStat(file);
				console.log(`${cid} ${type} ${formatSize(size)}`);
			} catch (error) {
				console.error(`Error fetching data for ${file}:`, error);
			}
		}
	}
}

main().catch(console.error);
