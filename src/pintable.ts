/**
 * @description Show a table of the pin content & their labels (aliases)
 * Doesn't IPFS daemon to be running because this one fetches data from MFS
 */

import Table from "cli-table3";
import inquirer from "inquirer";
import { formatSize } from "./utils/format-size.js";

type FileData = {
	name: string;
	cid: string;
	size: number;
	type: string;
};

/**
 * Run the command `ipfs files ls /` to list all the labels
 * then split the strings from the list of results to get all the folder name
 */
async function listFiles(): Promise<string[]> {
	const proc = Bun.spawn(["ipfs", "files", "ls", "/"], { stdout: "pipe" });
	const stdout = await new Response(proc.stdout).text();
	return stdout.trim().split("\n");
}

/**
 * Run the command `ipfs files stat /<path>` to get the CID and Size of each file/directory
 * For directory we will be using "CumulativeSize", otherwise use "Size"
 */
async function getFileStat(path: string) {
	const proc = Bun.spawn(["ipfs", "files", "stat", `/"${path}"`], {
		stdout: "pipe",
	});
	const stdout = await new Response(proc.stdout).text();
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
 * Display an interactive table of files and let user select a row
 * After selection, show a menu of options from 0-4
 */
async function displayInteractiveTable(filesData: FileData[]) {
	// First display the table
	const table = new Table({
		head: ["Name", "CID", "Size", "Type"],
		style: { head: ["cyan"] },
	});

	for (const file of filesData) {
		table.push([
			file.name.trim() || "(no name)",
			file.cid,
			formatSize(file.size),
			file.type,
		]);
	}

	console.log(table.toString());
	const choices = [
		...filesData.map((file, index) => ({
			name: `${file.name.trim() || "(no name)"} (${file.type}, ${formatSize(file.size)})`,
			value: index,
		})),
		{ name: "Exit", value: -1 },
	];
	// When the list is too long, we append the "Exit" option at the beginning of the array
	if (choices.length > 10) {
		choices.unshift({ name: "Exit", value: -1 });
	}
	// Let user select a row
	const { selectedFile } = await inquirer.prompt([
		{
			type: "list",
			name: "selectedFile",
			message: "Select a file (use arrow keys):",
			choices,
		},
	]);

	// Exit if user selected the Exit option
	if (selectedFile === -1) {
		console.log("Exiting...");
		return;
	}

	const selected = filesData[selectedFile];
	console.log(`\nSelected: ${selected.name} (${selected.cid})`);

	// Show options menu
	const { action } = await inquirer.prompt([
		{
			type: "list",
			name: "action",
			message: "Choose an action:",
			choices: [
				{ name: "0. View details", value: 0 },
				{ name: "1. Unpin file", value: 1 },
				{ name: "2. Copy CID to clipboard", value: 2 },
				{ name: "3. Exit", value: 3 },
			],
		},
	]);

	// Handle the selected action
	switch (action) {
		case 0:
			console.log("\nFile Details:");
			console.log(`Name: ${selected.name}`);
			console.log(`CID: ${selected.cid}`);
			console.log(`Size: ${formatSize(selected.size)}`);
			console.log(`Type: ${selected.type}`);
			break;
		case 1:
			console.log(`Unpinning ${selected.name}...`);
			await Bun.spawn(["ipfs", "pin", "rm", selected.cid]).exited;
			break;
		case 2:
			// Copy to clipboard - using a simple approach for now
			await Bun.spawn(["bash", "-c", `echo "${selected.cid}" | pbcopy`]).exited;
			console.log("CID copied to clipboard!");
			break;
		case 3:
			console.log("Exiting...");
			break;
	}
}

/**
 * Main function to get files and display them interactively
 */
async function main() {
	const files = await listFiles();

	// Collect all file data first
	const filesData: FileData[] = [];
	for (const file of files) {
		try {
			const { cid, size, type } = await getFileStat(file);
			filesData.push({
				name: file,
				cid,
				size,
				type,
			});
		} catch (error) {
			console.error(`Error fetching data for ${file}:`, error);
		}
	}

	await displayInteractiveTable(filesData);
}

main().catch(console.error);
