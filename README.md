# ipfs-cli-helper

A CLI tool to help manage IPFS files and pins.

## Installation

```bash
bun install
```

## Usage

### Display Pin Table

View files in IPFS MFS:

```bash
# Simple list format
bun pintable

# Enhanced table format
bun pintable --enhanced
# or
bun pintable -E
```

### Interactive Pin Table

Navigate and manage your IPFS files with an interactive interface:

```bash
bun pintable:interactive
# or
bun pintable --interactive
# or
bun pintable -I
```

The interactive mode allows you to:
- Select files using arrow keys
- Press Enter to select a file
- Choose from options:
  - 0: View file details
  - 1: Pin file
  - 2: Unpin file 
  - 3: Copy CID to clipboard
  - 4: Exit

### Other Commands

```bash
# View peer table
bun peertable

# Pin files
bun pin
```

This project was created using `bun init` in bun v1.2.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
