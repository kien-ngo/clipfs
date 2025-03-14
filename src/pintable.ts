import { exec } from "node:child_process";
import util from "node:util";
import Table from "cli-table3";
import { formatSize } from "./utils/format-size";

const execAsync = util.promisify(exec);

/**
 * Run the command `ipfs files ls /` to list all the labels
 * then split the strings from the list of results to get all the folder name
 */
async function listFiles(): Promise<string[]> {
	const { stdout } = await execAsync("ipfs files ls /");
	return stdout.trim().split("\n");
}

/**
 * Run the command `ipfs files stat /<path>` to get the CID and Size of each file/directory
 * For directory we will be using "CumulativeSize", otherwise use "Size"
 */
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

/**
 * If user passes the 'enhanced' flag using either `--enhanced` or `-E`, we print out a nice table using cli-table3
 * otherwise we print out a simple list
 */
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
