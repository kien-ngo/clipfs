#!/usr/bin/env bun
import { dirname, join } from "node:path";

const __filename = Bun.fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = process.argv[2];

if (!command) {
	console.log(`
Usage: clipfs <command>

Available commands:
  pintable   - Interactive table for IPFS MFS files
  peertable  - Display IPFS peers in a table 
  pin        - Pin management utilities
  `);
	process.exit(0);
}

const validCommands = ["pintable", "peertable", "pin"];

if (!validCommands.includes(command)) {
	console.error(`Unknown command: ${command}`);
	console.error("Available commands: pintable, peertable, pin");
	process.exit(1);
}

// Pass all arguments after the command
const args = process.argv.slice(3);
const scriptPath = join(__dirname, `${command}.js`);

// Execute the corresponding script
const child = Bun.spawn(["bun", scriptPath, ...args], {
	stdio: ["inherit", "inherit", "inherit"],
});

child.exited.then((code) => {
	process.exit(code || 0);
});
