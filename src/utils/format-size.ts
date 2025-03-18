/**
 * IPFS Kubo returns file sizes in numbers representing bytes
 * @param bytes number The amount of byte
 * @returns a string represents size in gigabytes
 */
export function formatSize(bytes: number): string {
	return `${(bytes / 1024 ** 3).toFixed(4)} GB`;
}
