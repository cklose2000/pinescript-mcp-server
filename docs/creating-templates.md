# Creating Effective Templates

This guide provides instructions and best practices for creating high-quality templates in the PineScript MCP Template System. Well-designed templates are crucial for getting optimal results from language models when analyzing and optimizing trading strategies.

## Table of Contents

1. [Template Structure](#template-structure)
2. [Prompt Engineering Best Practices](#prompt-engineering-best-practices)
3. [Using Sections Effectively](#using-sections-effectively)
4. [Placeholder Design](#placeholder-design)
5. [Example Templates](#example-templates)
6. [Testing Your Templates](#testing-your-templates)

## Template Structure

### Basic Template Layout

A template consists of several key parts:

1. **Metadata**: ID, name, description, category, and version
2. **Sections**: The content blocks that make up the template
3. **Placeholders**: Variables that get replaced when the template is rendered

Here's a basic template structure:

```typescript
import { createTemplate, PromptCategory, StandardSections, TemplateSection } from '../templateStructure.js';

// Custom sections if needed
const customSection: TemplateSection = {
  title: 'Custom Section Title',
  content: `Your custom section content with {{placeholder}} support.`
};

// Create the template
export const myTemplate = createTemplate(
  'my-template-id',            // Unique identifier
  'My Template Name',          // Human-readable name
  'Description of the template', // Purpose description
  PromptCategory.ANALYSIS,     // Category 
  [                            // Sections array
    StandardSections.INTRODUCTION,
    StandardSections.TASK,
    customSection,
    StandardSections.OUTPUT_FORMAT
  ],
  ['placeholder1', 'placeholder2'] // Placeholders array
);

export default myTemplate;
```

### Section Types

Templates use sections to organize content. Each section has:

- **Title**: A heading for the section
- **Content**: The text content, which can include placeholders

## Prompt Engineering Best Practices

### Setting Clear Context

1. **Define the role clearly**: Tell the LLM exactly what expertise it should emulate
2. **Establish the scope**: Set boundaries on what the LLM should and shouldn't address
3. **Provide reference points**: Include examples or benchmarks when appropriate

Example introduction section:

```typescript
const introSection: TemplateSection = {
  title: 'Introduction',
  content: `You are an expert PineScript developer and quantitative trading specialist with deep knowledge of technical analysis, algorithmic trading strategies, and financial market behavior. You specialize in analyzing and optimizing trading strategies based on their code implementation and historical performance.`
};
```

### Task Definition

1. **Be specific**: Clearly define what the LLM needs to do
2. **Set priorities**: Indicate which aspects of the task are most important
3. **Define steps**: Break complex tasks into steps when appropriate

Example task section:

```typescript
const taskSection: TemplateSection = {
  title: 'Task',
  content: `Your task is to analyze the provided PineScript strategy code and recommend parameter optimizations that could improve its performance. Focus on identifying parameters that have the most impact on strategy performance, and suggest specific value adjustments with rationale.`
};
```

### Output Structuring

1. **Define format precisely**: Specify the exact format you want the output in
2. **Use examples**: Show a sample of the expected output format
3. **Include validation cues**: Add hints that help the LLM validate its own output

Example output format section:

```typescript
const outputFormatSection: TemplateSection = {
  title: 'Output Format',
  content: `Your response must be in valid JSON format with the following structure:

{
  "parameterSuggestions": [
    {
      "name": "parameter name",
      "currentValue": current value,
      "suggestedValue": suggested value,
      "rationale": "explanation for this suggestion",
      "expectedImpact": "expected performance improvement"
    }
  ],
  "optimizationApproach": {
    "methodology": "suggested optimization method",
    "metrics": ["primary metrics to optimize for"],
    "timeframes": ["relevant timeframes to consider"]
  }
}

Do not include any text before or after the JSON. Ensure the JSON is valid and properly formatted.`
};
```

## Using Sections Effectively

### Standard Sections

The template system provides standard sections you can reuse:

- **INTRODUCTION**: Define the role and expertise of the LLM
- **TASK**: Specify what the LLM should do
- **CONTEXT**: Provide necessary background information
- **EXAMPLES**: Show examples of expected outputs
- **CONSTRAINTS**: Set limitations and guardrails
- **OUTPUT_FORMAT**: Define how the response should be formatted

### Custom Sections

For specialized templates, you can create custom sections:

```typescript
const marketRegimeSection: TemplateSection = {
  title: 'Market Regime Analysis',
  content: `Analyze how the strategy might perform in different market regimes:
  
1. Trending markets (bull/bear)
2. Sideways/range-bound markets
3. High volatility environments
4. Low volatility environments

Consider how the parameters should be adjusted for each regime.`
};
```

### Section Order

The order of sections matters. A typical effective sequence is:

1. Introduction (role/expertise)
2. Task (what to do)
3. Context (input data)
4. Examples (sample outputs)
5. Constraints (limitations/guardrails)
6. Output Format (response structure)

## Placeholder Design

Placeholders are variables in your template that get replaced with actual values when rendered.

### Naming Conventions

- Use descriptive names: `strategy`, `timeframe`, `performance`
- Keep names concise but clear
- Use camelCase for multi-word names: `strategyCode`, `backtestResults`

### Context Preparation

When designing placeholders, consider:

1. What information is necessary for the task
2. How the information will be formatted
3. Any preprocessing that might be required

For example:

```typescript
const contextSection: TemplateSection = {
  title: 'Context',
  content: `Here is the PineScript strategy to analyze:

\`\`\`pinescript
{{strategy}}
\`\`\`

Backtest performance metrics:
\`\`\`
{{performance}}
\`\`\`

Timeframe: {{timeframe}}

Focus on these specific parameters if provided: {{parameters}}
`
};
```

## Example Templates

### Analysis Template

```typescript
import { createTemplate, PromptCategory, StandardSections } from '../templateStructure.js';

// Analysis template sections
const taskSection = {
  ...StandardSections.TASK,
  content: `Your task is to analyze the provided PineScript strategy and identify its strengths, weaknesses, and potential improvements.`
};

const contextSection = {
  ...StandardSections.CONTEXT,
  content: `Here is the strategy code:

\`\`\`pinescript
{{strategy}}
\`\`\`

Timeframe: {{timeframe}}
`
};

const outputFormatSection = {
  ...StandardSections.OUTPUT_FORMAT,
  content: `Provide your analysis in JSON format:

{
  "overview": "Brief description of the strategy",
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...]
}`
};

// Create the template
export const analysisTemplate = createTemplate(
  'strategy-analysis-simple',
  'Simple Strategy Analysis',
  'Analyzes a PineScript strategy to identify strengths and weaknesses',
  PromptCategory.ANALYSIS,
  [
    StandardSections.INTRODUCTION,
    taskSection,
    contextSection,
    outputFormatSection
  ],
  ['strategy', 'timeframe']
);

export default analysisTemplate;
```

### Optimization Template

```typescript
import { createTemplate, PromptCategory, StandardSections } from '../templateStructure.js';

// Optimization template sections
const taskSection = {
  ...StandardSections.TASK,
  content: `Your task is to suggest parameter optimizations for the provided strategy based on its code and performance metrics.`
};

const contextSection = {
  ...StandardSections.CONTEXT,
  content: `Strategy code:
\`\`\`pinescript
{{strategy}}
\`\`\`

Performance metrics:
\`\`\`
{{performance}}
\`\`\`

Parameters to focus on: {{parameters}}
`
};

const outputFormatSection = {
  ...StandardSections.OUTPUT_FORMAT,
  content: `Provide your optimization suggestions in JSON format:

{
  "parameterSuggestions": [
    {
      "name": "parameter name",
      "currentValue": current value,
      "suggestedValue": suggested value,
      "rationale": "explanation"
    }
  ]
}`
};

// Create the template
export const optimizationTemplate = createTemplate(
  'simple-optimization',
  'Simple Strategy Optimization',
  'Suggests parameter optimizations for a PineScript strategy',
  PromptCategory.OPTIMIZATION,
  [
    StandardSections.INTRODUCTION,
    taskSection,
    contextSection,
    outputFormatSection
  ],
  ['strategy', 'performance', 'parameters']
);

export default optimizationTemplate;
```

## Testing Your Templates

### Manual Testing

To test your template manually:

1. Create the template file in `src/prompts/templates/`
2. Build the project: `npm run build`
3. Test with the CLI: `npm run cli templates list`
4. Verify your template is loaded
5. Test rendering with appropriate test data

### Automated Testing

Write tests for your templates:

```typescript
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { templateManager } from '../prompts/templateManager.js';
import './myCustomTemplate.js';

describe('My Custom Template', () => {
  it('should load and render correctly', async () => {
    const template = await templateManager.getTemplate('my-custom-template');
    expect(template).to.not.be.null;
    
    if (template) {
      const context = {
        strategy: '// Test strategy',
        timeframe: '1h'
      };
      
      const prompt = await templateManager.renderTemplate(template, context);
      expect(prompt).to.include('Test strategy');
      expect(prompt).to.include('1h');
    }
  });
});
```

### Best Practices for Testing

1. **Test with real data**: Use actual strategy code and performance metrics
2. **Test edge cases**: Try empty values, very long inputs, etc.
3. **Validate LLM responses**: Check if the LLM follows your output format
4. **Get peer review**: Have other developers review your templates

By following these guidelines, you'll create effective templates that generate high-quality, consistent results from language models. 