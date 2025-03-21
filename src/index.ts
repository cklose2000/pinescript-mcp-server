/**
 * TradingView PineScript MCP Server
 * 
 * MCP server for PineScript validation, fixing, and templates
 */

// Import patched protocol first to ensure timeout is set before FastMCP is initialized
import './patched-protocol.js';

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { validatePineScript } from './validators/syntaxValidator.js';
import { fixPineScriptErrors } from './fixers/errorFixer.js';
import { getTemplate, TemplateType } from './templates/templateManager.js';
import { VersionManager } from './utils/versionManager.js';
import { PineScriptVersion } from './utils/versionDetector.js';
import { registerConfigTools } from './config/configTool.js';
import { config as userConfig } from './config/userConfig.js';
import { formatPineScript, FormatOptions } from './utils/formatter.js';
import { getTestScript, getVersionedTestScript } from './templates/testScript.js';
import { DEFAULT_PROTOCOL_CONFIG } from './config/protocolConfig.js';
import { createRequestOptions } from './patched-protocol.js';

/**
 * Main function to run the MCP server
 */
async function main() {
  try {
    console.log('Starting PineScript MCP server...');
    
    // Create the version manager
    const versionManager = new VersionManager(userConfig.versionManagement.storageDirectory);
    
    // Initialize MCP server with name and version
    const mcp = new FastMCP({
      name: 'PineScript MCP',
      version: '1.0.0'
      // Note: Timeout is handled by our patched protocol
    });
    
    // Register configuration tools
    registerConfigTools(mcp);
    
    // Add test connection tool
    mcp.addTool({
      name: 'test_connection',
      description: 'Test MCP server connectivity with a minimal script',
      parameters: z.object({
        version: z.string().describe('PineScript version to test with').default('5')
      }),
      execute: async (params) => {
        console.log('Testing server connection...');
        
        try {
          // Get test script for specified version (or default to v5)
          const version = params.version || '5';
          const testScript = getVersionedTestScript(version);
          
          console.log(`Running connection test with minimal v${version} script...`);
          
          // Validate the test script
          const result = validatePineScript(testScript);
          
          console.log('Connection test completed successfully');
          
          return JSON.stringify({
            success: true,
            message: 'MCP server connection is working correctly',
            validation_result: result
          });
        } catch (error) {
          console.error('Connection test failed:', error);
          
          return JSON.stringify({
            success: false,
            message: `MCP server connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            error: String(error)
          });
        }
      }
    });
    
    // Add tool for validating PineScript with extended timeout
    mcp.addTool({
      name: 'validate_pinescript',
      description: 'Validates PineScript code for syntax errors',
      parameters: z.object({
        script: z.string().describe('The PineScript code to validate'),
        version: z.string().describe('The PineScript version (v4, v5, v6)').default('v5')
      }),
      execute: async (params, context) => {
        console.log('Processing validation request with extended timeout...');
        
        try {
          // Create a validation context with progress reporting
          const validationContext = {
            reportProgress: (progress: any) => {
              if (context && context.reportProgress) {
                // Send progress updates to reset the timeout
                context.reportProgress(progress);
              }
            }
          };
          
          // Validate the script with progress reporting
          const result = validatePineScript(params.script, params.version, validationContext);
          
          console.log('Validation completed successfully');
          
          return JSON.stringify({
            valid: result.valid,
            errors: result.errors,
            warnings: result.warnings
          });
        } catch (error: any) {
          console.error('Validation error:', error);
          return JSON.stringify({
            valid: false,
            errors: [`Validation error: ${error.message || 'Unknown error'}`],
            warnings: []
          });
        }
      }
    });
    
    // Add tool for fixing common PineScript errors
    mcp.addTool({
      name: 'fix_pinescript_errors',
      description: 'Automatically fixes common syntax errors in PineScript',
      parameters: z.object({
        script: z.string().describe('The PineScript code to fix'),
        version: z.string().describe('The PineScript version (v4, v5, v6)').default('v5')
      }),
      execute: async (params) => {
        const { script } = params;
        const result = fixPineScriptErrors(script);
        return JSON.stringify({
          fixed: result.fixed,
          fixedCode: result.script,
          changes: result.changes
        });
      }
    });
    
    // Add tool for getting PineScript templates
    mcp.addTool({
      name: 'get_pinescript_template',
      description: 'Get a template for a PineScript strategy or indicator',
      parameters: z.object({
        type: z.enum(['strategy', 'indicator']).describe('Template type (strategy or indicator)'),
        name: z.string().describe('Template name (e.g., "macd", "rsi")')
      }),
      execute: async (params) => {
        const { type, name } = params;
        const template = getTemplate(type as TemplateType, name);
        const validation = validatePineScript(template);
        
        return JSON.stringify({
          template,
          valid: validation.valid,
          warnings: validation.warnings
        });
      }
    });
    
    // Add tool for upgrading/downgrading PineScript versions
    mcp.addTool({
      name: 'convert_pinescript_version',
      description: 'Convert PineScript code between versions',
      parameters: z.object({
        script: z.string().describe('The PineScript code to convert'),
        target_version: z.enum(['v4', 'v5', 'v6']).describe('The target PineScript version')
      }),
      execute: async (params) => {
        const { script, target_version } = params;
        const targetVersion = target_version as PineScriptVersion;
        const convertedScript = versionManager.upgradeVersion(script, targetVersion);
        const validation = validatePineScript(convertedScript, targetVersion);
        
        return JSON.stringify({
          convertedScript,
          valid: validation.valid,
          warnings: validation.warnings
        });
      }
    });
    
    // Add tool for saving script versions
    mcp.addTool({
      name: 'save_pinescript_version',
      description: 'Save a version of PineScript code',
      parameters: z.object({
        script: z.string().describe('The PineScript code to save'),
        notes: z.string().describe('Notes about this version').optional()
      }),
      execute: async (params) => {
        const { script, notes } = params;
        const scriptId = versionManager.saveVersion(script, notes);
        const history = versionManager.getVersionHistory(scriptId);
        
        // Create simplified version for JSON serialization
        const latestVersion = history.length > 0 ? {
          id: history[history.length - 1].id,
          timestamp: history[history.length - 1].timestamp,
          version: history[history.length - 1].version,
          valid: history[history.length - 1].valid,
          notes: history[history.length - 1].notes
        } : null;
        
        return JSON.stringify({
          scriptId,
          versionCount: history.length,
          latestVersion
        });
      }
    });
    
    // Add tool for retrieving script version history
    mcp.addTool({
      name: 'get_pinescript_history',
      description: 'Get version history for a PineScript',
      parameters: z.object({
        script_id: z.string().describe('The script ID to retrieve history for')
      }),
      execute: async (params) => {
        const { script_id } = params;
        const history = versionManager.getVersionHistory(script_id);
        
        // Create simplified version array for JSON serialization
        const versions = history.map(v => ({
          timestamp: v.timestamp,
          version: v.version,
          valid: v.valid,
          notes: v.notes
        }));
        
        return JSON.stringify({
          scriptId: script_id,
          versionCount: history.length,
          versions
        });
      }
    });
    
    // Add tool for comparing script versions
    mcp.addTool({
      name: 'compare_pinescript_versions',
      description: 'Compare two versions of PineScript code',
      parameters: z.object({
        old_script: z.string().describe('The old PineScript code'),
        new_script: z.string().describe('The new PineScript code')
      }),
      execute: async (params) => {
        const { old_script, new_script } = params;
        const changes = versionManager.compareVersions(old_script, new_script);
        
        return JSON.stringify({
          changeCount: changes.length,
          changes
        });
      }
    });
    
    // Add tool for formatting PineScript code
    mcp.addTool({
      name: 'format_pinescript',
      description: 'Format PineScript code according to best practices',
      parameters: z.object({
        script: z.string().describe('The PineScript code to format'),
        indent_size: z.number().describe('Indentation size (number of spaces)').default(userConfig.output.includeLineNumbers ? 4 : 2).optional(),
        use_spaces: z.boolean().describe('Use spaces for indentation (vs tabs)').default(true).optional(),
        spaces_around_operators: z.boolean().describe('Add spaces around operators').default(true).optional(),
        space_after_commas: z.boolean().describe('Add space after commas').default(true).optional(),
        max_line_length: z.number().describe('Maximum line length').default(80).optional(),
        keep_blank_lines: z.boolean().describe('Keep blank lines in code').default(true).optional(),
        braces_on_new_line: z.boolean().describe('Place opening braces on new line').default(false).optional(),
        align_comments: z.boolean().describe('Align consecutive line comments').default(true).optional(),
        update_version_comment: z.boolean().describe('Update version comment if needed').default(true).optional()
      }),
      execute: async (params) => {
        const { 
          script, 
          indent_size, 
          use_spaces, 
          spaces_around_operators, 
          space_after_commas, 
          max_line_length, 
          keep_blank_lines, 
          braces_on_new_line, 
          align_comments, 
          update_version_comment 
        } = params;
        
        // Build format options
        const formatOptions: Partial<FormatOptions> = {
          indentSize: indent_size,
          useSpaces: use_spaces,
          spacesAroundOperators: spaces_around_operators,
          spaceAfterCommas: space_after_commas,
          maxLineLength: max_line_length,
          keepBlankLines: keep_blank_lines,
          bracesOnNewLine: braces_on_new_line,
          alignComments: align_comments,
          updateVersionComment: update_version_comment
        };
        
        // Format the script
        const result = formatPineScript(script, formatOptions);
        
        // Validate the formatted script to ensure it's still valid
        const validation = validatePineScript(result.formatted);
        
        return JSON.stringify({
          formatted: result.formatted,
          changes: result.changes,
          warnings: result.warnings,
          valid: validation.valid,
          validation_warnings: validation.warnings,
          validation_errors: validation.errors
        });
      }
    });
    
    // Start the server
    await mcp.start({ 
      transportType: 'stdio'
    });
    
    console.log('PineScript MCP server started successfully');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Log startup with timeout information
console.log('Starting PineScript MCP server with extended timeout (5 minutes)');

// Run the main function with error handling
main().catch(error => {
  console.error('Unhandled error in MCP server:', error);
  process.exit(1);
}); 