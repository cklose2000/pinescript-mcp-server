# Template System User Guide

This guide provides instructions for using the PineScript MCP Template System, which allows you to manage and utilize prompt templates for strategy analysis, backtest interpretation, and strategy optimization.

## Table of Contents

1. [Overview](#overview)
2. [CLI Commands](#cli-commands)
3. [Creating Custom Templates](#creating-custom-templates)
4. [Using Templates in Code](#using-templates-in-code)
5. [Database Integration](#database-integration)
6. [Vector Search](#vector-search)
7. [Troubleshooting](#troubleshooting)

## Overview

The Template System provides a structured way to create, manage, and use prompt templates for various PineScript analysis tasks. It offers:

- A library of pre-defined templates for common tasks
- Support for custom templates with versioning
- Database storage for template persistence
- Vector search for finding relevant templates based on semantic similarity
- CLI commands for easy template management

## CLI Commands

The template system can be accessed through the CLI:

```bash
# List all available templates
npm run cli templates list

# List templates in a specific category
npm run cli templates list -c optimization

# Test the template system
npm run cli templates test

# Optimize a PineScript strategy
npm run cli templates optimize examples/bollinger_strategy.pine -p examples/backtest_results.txt

# Search for templates semantically
npm run cli templates search "how to optimize my strategy for less drawdown"

# Sync templates to database (if enabled)
npm run cli templates sync

# Create vector embeddings for templates (if enabled)
npm run cli templates embed
```

### Command Details

#### `templates list`

Lists all available templates or templates in a specific category.

Options:
- `-c, --category <category>`: Filter by category (analysis, backtest, enhancement, optimization)

#### `templates optimize`

Optimize a PineScript strategy using LLM-powered suggestions.

Arguments:
- `<strategy-file>`: Path to the PineScript strategy file

Options:
- `-p, --performance <file>`: Path to a file containing performance metrics
- `-o, --output <file>`: Output file path for optimization results (default: optimization-results.json)
- `--parameters <list>`: Comma-separated list of parameters to focus on

#### `templates search`

Search for templates using semantic vector search.

Arguments:
- `<query>`: Search query text

Options:
- `-c, --category <category>`: Filter by category
- `-t, --threshold <number>`: Similarity threshold (0.0-1.0)
- `-l, --limit <number>`: Maximum number of results

## Creating Custom Templates

You can create custom templates by defining a new template file in `src/prompts/templates/`.

### Template Structure

Templates are structured TypeScript objects with the following properties:

- `id`: Unique identifier for the template
- `name`: Descriptive name
- `description`: Brief description of the template's purpose
- `category`: Category from PromptCategory enum
- `sections`: Array of sections that make up the template
- `placeholders`: Array of placeholders used in the template
- `version` (optional): Version string

Here's a minimal example:

```typescript
// myCustomTemplate.ts
import { createTemplate, PromptCategory, StandardSections } from '../templateStructure.js';

export const myCustomTemplate = createTemplate(
  'my-custom-template',
  'My Custom Template',
  'Description of my custom template',
  PromptCategory.ANALYSIS,
  [
    StandardSections.INTRODUCTION,
    StandardSections.TASK,
    StandardSections.CONTEXT,
    StandardSections.OUTPUT_FORMAT
  ],
  ['strategy', 'timeframe']
);

export default myCustomTemplate;
```

### Standard Sections

The `StandardSections` object provides common sections that can be reused:

- `INTRODUCTION`: Sets the tone and role for the LLM
- `TASK`: Describes what the LLM should do
- `CONTEXT`: Provides context and information for the task
- `EXAMPLES`: Shows examples of expected output
- `CONSTRAINTS`: Lists constraints the LLM should adhere to
- `OUTPUT_FORMAT`: Specifies the format for the output

### Custom Sections

You can create custom sections by defining a `TemplateSection` object:

```typescript
const myCustomSection: TemplateSection = {
  title: 'Custom Section Title',
  content: 'Content with {{placeholder}} support'
};
```

## Using Templates in Code

You can use templates programmatically in your code:

```typescript
import { templateManager } from '../prompts/templateManager.js';

// Get a template by ID
const template = await templateManager.getTemplate('strategy-optimization');

// Create context with placeholders
const context = {
  strategy: '// Your strategy code here',
  performance: 'Your performance metrics here',
  parameters: 'param1,param2'
};

// Render the template with the context
const prompt = await templateManager.renderTemplate(template, context);

// Use the prompt with the LLM service
const result = await llmService.getTextCompletion(prompt);
```

## Database Integration

The template system supports storing templates in a Supabase database.

### Configuration

To enable database storage, configure Supabase in your `.env` file:

```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

And in your user configuration:

```json
"databases": {
  "supabase": {
    "enabled": true,
    "url": "your-supabase-url",
    "key": "your-supabase-key"
  }
}
```

### Template Versioning

When templates are saved to the database, they are automatically versioned. You can retrieve version history using:

```bash
npm run cli templates versions strategy-optimization
```

## Vector Search

The template system includes vector search capabilities for finding templates semantically.

### Setup

Vector search requires:

1. Supabase database with pgvector extension enabled
2. The `templateVectorStore` module

### Embedding Templates

Before you can search templates, you need to create embeddings:

```bash
npm run cli templates embed
```

This creates vector embeddings for all templates in the database.

### Searching Templates

You can search templates semantically:

```bash
npm run cli templates search "optimize trading strategy parameters"
```

Or programmatically:

```typescript
import templateVectorStore from '../prompts/templateVectorStore.js';

const results = await templateVectorStore.semanticTemplateSearch('optimize parameters', {
  category: PromptCategory.OPTIMIZATION,
  threshold: 0.75,
  limit: 5
});
```

## Troubleshooting

### Templates Not Loading

If templates aren't loading properly:

1. Ensure template files are in the correct directory (`src/prompts/templates/`)
2. Check that template files export a default template object
3. Verify that template objects have all required fields
4. Check for import errors in the console

### Database Connection Issues

If you're having trouble with database integration:

1. Verify Supabase credentials in your configuration
2. Check network connectivity to the Supabase instance
3. Ensure required tables exist in the database
4. Look for firewall or permission issues

### Vector Search Not Working

If vector search isn't working:

1. Make sure pgvector extension is enabled in Supabase
2. Verify that templates have been embedded (`templates embed`)
3. Check that the search query is meaningful and relevant to your templates
4. Try lowering the similarity threshold (default is 0.75) 