# clipfs

A CLI tool to help manage IPFS content in your local IPFS node. This app aims to be the alternative of `ipfs-webui` (with less features, for now) in the terminal environment. It does not replace `ipfs-kubo` but relies on it & compliments it.

It is a TypeScript app that requires either Bun or Node runtime to be installed on your machine. It interacts directly with the IPFS Kubo RPC commands via `Bun.spawn`.

## Installation

```bash
# Install globally on your local machine
npm install -g @kienngo/clipfs
# OR
bun install -g @kienngo/clipfs
```

## Usage

```bash
# Show help
clipfs

# View IPFS MFS files in interactive table
clipfs pintable

# View peer table
clipfs peertable

# Pin management
clipfs pin
```

### Interactive Pin Table

Navigate and manage your IPFS files with an interactive interface:

```bash
clipfs pintable
```

The interactive mode allows you to:
- Select files using arrow keys
- Press Enter to select a file
- Choose from options:
  - 0: View file details
  - 1: Unpin file 
  - 2: Copy CID to clipboard
  - 3: Exit

## Requirements

- Bun runtime (https://bun.sh)
- IPFS daemon running locally (IPFS Kubo installed on your machine)

## Development
Make sure all the requirements above are met!

```bash
# Clone the repository
git clone https://github.com/kien-ngo/clipfs.git
cd clipfs

# Install dependencies
bun install

# Build
bun run build

# Run commands locally
bun pintable
bun peertable
bun pin <option>
```

## Contribution
Knowledge about [IPFS Kubo RPC](https://docs.ipfs.tech/reference/kubo/cli/#ipfs) is required. If you have an idea or feature request then feel free to create a Github Issue. PRs are always welcomed.
