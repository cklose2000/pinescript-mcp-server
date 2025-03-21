/**
 * Configuration Tool for PineScript MCP
 * 
 * Provides MCP tools for managing user configuration
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { config, loadUserConfig, saveUserConfig, resetConfig, PineScriptConfig } from './userConfig';

export function registerConfigTools(mcp: FastMCP): void {
  // Register the MCP tools for configuration management
  
  // Get current configuration
  mcp.addTool({
    name: 'get_pinescript_config',
    description: 'Get the current PineScript MCP configuration',
    parameters: z.object({}),
    execute: async () => {
      const currentConfig = loadUserConfig();
      return JSON.stringify({
        config: currentConfig,
        success: true
      });
    }
  });

  // Update configuration
  mcp.addTool({
    name: 'update_pinescript_config',
    description: 'Update PineScript MCP configuration settings',
    parameters: z.object({
      config: z.record(z.any()).describe('Configuration object with the settings to update')
    }),
    execute: async ({ config: newConfig }) => {
      try {
        const updatedConfig = saveUserConfig(newConfig);
        return JSON.stringify({
          config: updatedConfig,
          success: true,
          message: 'Configuration updated successfully'
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          message: `Failed to update configuration: ${error}`,
          error: String(error)
        });
      }
    }
  });

  // Reset configuration
  mcp.addTool({
    name: 'reset_pinescript_config',
    description: 'Reset PineScript MCP configuration to default values',
    parameters: z.object({}),
    execute: async () => {
      try {
        const defaultConfig = resetConfig();
        return JSON.stringify({
          config: defaultConfig,
          success: true,
          message: 'Configuration reset to defaults'
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          message: `Failed to reset configuration: ${error}`,
          error: String(error)
        });
      }
    }
  });

  // Get specific config section
  mcp.addTool({
    name: 'get_config_section',
    description: 'Get a specific section of the PineScript MCP configuration',
    parameters: z.object({
      section: z.string().describe('The configuration section to retrieve')
    }),
    execute: async ({ section }) => {
      const currentConfig = loadUserConfig();
      const sectionConfig = currentConfig[section as keyof PineScriptConfig];
      
      if (!sectionConfig) {
        return JSON.stringify({
          success: false,
          message: `Section '${section}' not found in configuration`,
          availableSections: Object.keys(currentConfig)
        });
      }
      
      return JSON.stringify({
        config: sectionConfig,
        success: true
      });
    }
  });

  // Set custom templates directory
  mcp.addTool({
    name: 'set_templates_directory',
    description: 'Set a custom directory for PineScript templates',
    parameters: z.object({
      directory: z.string().describe('Path to custom templates directory')
    }),
    execute: async ({ directory }) => {
      try {
        // Get current config first
        const currentConfig = loadUserConfig();
        
        // Create update with all required fields
        const updatedConfig = saveUserConfig({
          templates: {
            defaultVersion: currentConfig.templates.defaultVersion,
            customTemplatesDir: directory
          }
        });
        
        return JSON.stringify({
          success: true,
          message: `Templates directory set to ${directory}`,
          config: updatedConfig.templates
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          message: `Failed to set templates directory: ${error}`,
          error: String(error)
        });
      }
    }
  });
} 