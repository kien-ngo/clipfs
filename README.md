# clipfs

A CLI tool to help manage IPFS files and pins.

## Installation

```bash
# Install globally from GitHub
npm install -g kien-ngo/clipfs
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

- Node.js ≥ 14
- IPFS daemon running locally

## Development

```bash
# Clone the repository
git clone https://github.com/kien-ngo/clipfs.git
cd clipfs

# Install dependencies
npm install

# Build
npm run build

# Run commands locally
npm run pintable
npm run peertable
npm run pin
```
