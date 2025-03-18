// Require IPFS daemon to be running

import { exec } from "node:child_process";
import util from "node:util";
import Table from "cli-table3";
import { formatSize } from "./utils/format-size.js";

const execAsync = util.promisify(exec);

/**
 * Run the command `ipfs swarm peers` to list all the labels
 * then split the strings from the list of results & extract the peerId from each strings
 */
async function listPeers(): Promise<string[]> {
	const { stdout } = await execAsync("ipfs swarm peers");
	return stdout.trim().split("\n");
}

/**
 * Extract a peer's IP address from a peer-string:
 * Example input: /ip6/2a02:****:****:3100:f81b:3bff:fe1a:d455/udp/4001/quic-v1/p2p/12D3KooWPHNUgDdo********x8VmU7r7hge8wNyT68kPnWYBL1B1
 * Output: 2a02:****:****:3100:f81b:3bff:fe1a:d455
 */
function extractIpAddress(input: string): string | null {
	const match = input.match(/\/(ip4|ip6)\/([^/]+)/);
	return match ? match[2] : null;
}

/**
 * From a peer's IP address we make the call to a service to get its geolocation info
 */
async function getPeerInfo(ip: string) {
	const response = await fetch(`https://ipinfo.io/${ip}/json`);
	const data = (await response.json()) as {
		ip: string;
		hostname: string;
		city: string;
		region: string;
		country: string;
		loc: string;
		org: string;
		postal: string;
		timezone: string;
		readme: string;
	};
	return data;
}

async function main() {
	const args = process.argv.slice(2);
	if (args.some((arg) => arg.startsWith("--limit="))) {
		console.log(
			"The list of peer will be limited to 20 items. To custom the limit, use the `--limit` flag",
		);
	}
	let limit = 20;
	for (const arg of args) {
		if (arg.startsWith("--limit=")) limit = Number(arg.split("=")[1] || 20);
	}
	const peers = (await listPeers()).splice(0, limit);
	const table = new Table({ head: ["PeerID", "Location"] });
	const tableData = (
		await Promise.all(
			peers.map(async (peerStr) => {
				const peerId = peerStr.split("/").at(-1);
				if (!peerId) return;
				const ip = extractIpAddress(peerStr);
				if (!ip) {
					return [peerId, "Unknown"];
				}
				const ipData = await getPeerInfo(ip);
				return [peerId, `${ipData.region} - ${ipData.country}`];
			}),
		)
	).filter((o) => o !== undefined);
	table.push(...tableData);
	console.log(table.toString());
}

main().catch(console.error);
