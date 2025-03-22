/**
 * Template Structure
 * 
 * This module defines the structure for prompt templates used in the PineScript MCP.
 * It provides a standardized format for templates, including sections for context,
 * examples, constraints, and output format.
 */

/**
 * Prompt categories for organization and filtering
 */
export enum PromptCategory {
  ANALYSIS = 'analysis',     // For strategy analysis
  ENHANCEMENT = 'enhancement', // For strategy enhancement generation
  OPTIMIZATION = 'optimization', // For parameter optimization suggestions
  BACKTEST = 'backtest',     // For backtest result analysis
  EDUCATIONAL = 'educational' // For explaining concepts or patterns
}

/**
 * Structure for a template section
 */
export interface TemplateSection {
  id: string;        // Unique identifier for this section
  title: string;     // Human-readable title for the section
  content: string;   // The actual content of the section
  required: boolean; // Whether this section is required in the template
  order: number;     // The order in which this section should appear
}

/**
 * Structure for a prompt template
 */
export interface PromptTemplate {
  id: string;                      // Unique identifier for this template
  name: string;                    // Human-readable name for the template
  description: string;             // Description of what this template does
  category: PromptCategory;        // The category this template belongs to
  version?: string;                 // Version of this template
  sections: TemplateSection[];     // The sections that make up this template
  placeholders?: string[];          // The placeholders that need to be filled in
  defaultModel?: string;           // The default model to use with this template
  requiredTokens?: number;         // The minimum number of tokens required for this template
  outputFormat?: string;          // The expected output format
  examples?: string[];             // Example usage of this template
}

/**
 * Standard sections that can be used in templates
 */
export const StandardSections = {
  INTRODUCTION: {
    id: 'introduction',
    title: 'Introduction',
    content: 'You are an expert PineScript developer with deep knowledge of technical analysis and algorithmic trading strategies.',
    required: true,
    order: 0
  },
  TASK: {
    id: 'task',
    title: 'Task',
    content: 'Your task is to...',
    required: true,
    order: 10
  },
  CONTEXT: {
    id: 'context',
    title: 'Context',
    content: 'Here is the relevant context...',
    required: true,
    order: 20
  },
  EXAMPLES: {
    id: 'examples',
    title: 'Examples',
    content: 'Here are some examples to guide your response...',
    required: false,
    order: 30
  },
  CONSTRAINTS: {
    id: 'constraints',
    title: 'Constraints',
    content: 'Please adhere to these constraints in your response...',
    required: true,
    order: 40
  },
  OUTPUT_FORMAT: {
    id: 'output_format',
    title: 'Output Format',
    content: 'Your response should follow this format...',
    required: true,
    order: 50
  }
};

/**
 * Assemble a prompt from a template and placeholder values
 */
export function assemblePrompt(
  template: PromptTemplate, 
  context: Record<string, any>, 
  replacements: Record<string, string> = {}
): string {
  // Sort sections by order
  const sortedSections = [...template.sections].sort((a, b) => a.order - b.order);
  
  // Assemble the prompt
  let prompt = '';
  
  for (const section of sortedSections) {
    let sectionContent = section.content;
    
    // Replace context variables if they exist in the section content
    if (context) {
      // Replace context variables using {{context.variable}} syntax
      const contextRegex = /{{context\.([^}]+)}}/g;
      sectionContent = sectionContent.replace(contextRegex, (match, key) => {
        const keyPath = key.split('.');
        let value = context;
        
        // Navigate through nested objects
        for (const k of keyPath) {
          if (value === undefined || value === null) return match;
          value = value[k];
        }
        
        if (value === undefined || value === null) return match;
        
        // Format objects and arrays as JSON
        if (typeof value === 'object') {
          return JSON.stringify(value, null, 2);
        }
        
        return String(value);
      });
    }
    
    prompt += `# ${section.title}\n${sectionContent}\n\n`;
  }
  
  // Replace explicit placeholders
  return Object.entries(replacements).reduce(
    (result, [key, value]) => result.replace(new RegExp(`{{${key}}}`, 'g'), value),
    prompt
  );
}

/**
 * Create a new template with validation
 */
export function createTemplate(
  id: string,
  name: string,
  description: string,
  category: PromptCategory,
  sections: TemplateSection[],
  placeholders?: string[],
  defaultModel?: string
): PromptTemplate {
  const template: PromptTemplate = {
    id,
    name,
    description,
    category,
    version: '1.0.0',
    sections,
    placeholders,
    defaultModel
  };
  
  validateTemplate(template);
  return template;
}

/**
 * Validate a template for required sections and structure
 * Returns true if valid, throws an error if invalid
 */
export function validateTemplate(template: PromptTemplate): boolean {
  try {
    // Check required fields
    if (!template.id) throw new Error('Template must have an ID');
    if (!template.name) throw new Error('Template must have a name');
    if (!template.description) throw new Error('Template must have a description');
    if (!template.category) throw new Error('Template must have a category');
    if (!template.sections || template.sections.length === 0) {
      throw new Error('Template must have at least one section');
    }
    
    // Check required sections
    const hasIntroduction = template.sections.some(s => s.id === StandardSections.INTRODUCTION.id);
    const hasTask = template.sections.some(s => s.id === StandardSections.TASK.id);
    const hasContext = template.sections.some(s => s.id === StandardSections.CONTEXT.id);
    const hasOutputFormat = template.sections.some(s => s.id === StandardSections.OUTPUT_FORMAT.id);
    
    if (!hasIntroduction) throw new Error('Template must have an Introduction section');
    if (!hasTask) throw new Error('Template must have a Task section');
    if (!hasContext) throw new Error('Template must have a Context section');
    if (!hasOutputFormat) throw new Error('Template must have an Output Format section');
    
    // Check for placeholders in context
    if (template.placeholders && template.placeholders.length > 0) {
      const contextSection = template.sections.find(s => s.id === StandardSections.CONTEXT.id);
      if (contextSection) {
        for (const placeholder of template.placeholders) {
          const placeholderPattern = new RegExp(`{{${placeholder}}}`, 'g');
          if (!placeholderPattern.test(contextSection.content) && 
              !template.sections.some(s => placeholderPattern.test(s.content))) {
            throw new Error(`Placeholder {{${placeholder}}} is declared but not used in any section`);
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.warn(`Template validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

// Export module
export default {
  PromptCategory,
  StandardSections,
  assemblePrompt,
  createTemplate,
  validateTemplate
}; 