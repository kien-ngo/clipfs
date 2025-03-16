export function formatSize(bytes: number): string {
	return `${(bytes / 1024 ** 3).toFixed(4)} GB`;
}
