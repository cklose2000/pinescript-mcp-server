# TradingView PineScript MCP Server

A Model Context Protocol (MCP) server for working with TradingView PineScript. This server provides tools for validating, fixing, and generating PineScript code through a standardized API.

## Features

- **PineScript Validation** - Automatically validates PineScript code for syntax errors and warnings
- **Error Fixing** - Automatically fixes common PineScript syntax errors
- **Template Generation** - Provides validated templates for various PineScript strategies and indicators

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/pinescriptproject1.git
cd pinescriptproject1
```

2. Install dependencies
```bash
npm install
```

3. Build the project
```bash
npm run build
```

### Running the Server

Start the MCP server:
```bash
npm run start-server
```

This will start the server with stdio transport, which allows it to communicate with MCP clients.

## API

### Tools

The MCP server exposes the following tools:

#### 1. `validate_pinescript`

Validates PineScript code for syntax errors and warnings.

**Parameters:**
- `script` (string): The PineScript code to validate
- `version` (string, optional): Expected PineScript version (e.g., 'v5', 'v4')

**Returns:**
- `valid` (boolean): Whether the script is valid
- `errors` (string[]): List of syntax errors
- `warnings` (string[]): List of warnings

#### 2. `fix_pinescript_errors`

Automatically fixes common syntax errors in PineScript code.

**Parameters:**
- `script` (string): The PineScript code to fix

**Returns:**
- `fixed` (boolean): Whether any fixes were applied
- `fixedCode` (string): The fixed script
- `changes` (string[]): List of changes made

#### 3. `get_pinescript_template`

Provides validated templates for common PineScript strategies and indicators.

**Parameters:**
- `template_type` (string): Type of template ('strategy' or 'indicator')
- `name` (string): Template name

**Returns:**
- `template` (string): The template code
- `message` (string): Confirmation message

## Supported PineScript Features

### Syntax Validation

The validator currently checks for:
- Empty scripts
- Version annotations
- Balanced parentheses
- String quotes
- Comma placement in function calls
- Deprecated functions in PineScript v5
- Incorrect variable export syntax

### Error Fixing

The fixer can automatically fix:
- Missing version annotations
- Unbalanced parentheses
- Unclosed string literals
- Missing commas in function calls
- Deprecated study() function
- Incorrect variable export syntax

## Development

### Running Tests

```bash
npm test
```

### Debugging

To run the server in development mode with automatic reloading:
```bash
npm run dev
```

## License

ISC

## Contributing

Contributions are welcome! 