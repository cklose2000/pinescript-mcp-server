/**
 * Tests for configuration tools
 */

import { jest } from '@jest/globals';
import { FastMCP } from 'fastmcp';
import { registerConfigTools } from '../../src/config/configTool';
import { loadUserConfig, saveUserConfig, resetConfig, PineScriptConfig } from '../../src/config/userConfig';

// Define interface for mock tool
interface MockTool {
  name: string;
  execute: (params: any) => Promise<string>;
}

// Mock FastMCP
jest.mock('fastmcp', () => ({
  FastMCP: jest.fn().mockImplementation(() => ({
    addTool: jest.fn()
  }))
}));

// Mock userConfig functions
jest.mock('../../src/config/userConfig', () => ({
  loadUserConfig: jest.fn(),
  saveUserConfig: jest.fn(),
  resetConfig: jest.fn(),
  PineScriptConfig: {}
}));

describe('PineScript Configuration Tools', () => {
  let mcp: { addTool: jest.Mock };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mcp = { addTool: jest.fn() };
    
    // Set up default mock implementations
    (loadUserConfig as jest.Mock).mockReturnValue({
      templates: {
        defaultVersion: 5,
        customTemplatesDir: null
      },
      validation: {
        strictMode: false
      }
    });
    
    (saveUserConfig as jest.Mock).mockImplementation((newConfig: Partial<PineScriptConfig>) => {
      return {
        templates: {
          defaultVersion: 5,
          customTemplatesDir: null
        },
        validation: {
          strictMode: false,
          ...(newConfig.validation || {})
        },
        ...(newConfig as any)
      };
    });
    
    (resetConfig as jest.Mock).mockReturnValue({
      templates: {
        defaultVersion: 5,
        customTemplatesDir: null
      },
      validation: {
        strictMode: false
      }
    });
  });
  
  it('should register all configuration tools with MCP', () => {
    // Action
    registerConfigTools(mcp as any);
    
    // Assert
    expect(mcp.addTool).toHaveBeenCalledTimes(5);
    
    // Verify each tool was registered
    const calls = mcp.addTool.mock.calls;
    expect(calls[0][0].name).toBe('get_pinescript_config');
    expect(calls[1][0].name).toBe('update_pinescript_config');
    expect(calls[2][0].name).toBe('reset_pinescript_config');
    expect(calls[3][0].name).toBe('get_config_section');
    expect(calls[4][0].name).toBe('set_templates_directory');
  });
  
  it('should get current configuration', async () => {
    // Setup
    registerConfigTools(mcp as any);
    const getTool = mcp.addTool.mock.calls.find(
      call => call[0].name === 'get_pinescript_config'
    )?.[0] as MockTool;
    
    if (!getTool) {
      throw new Error('Tool not found');
    }
    
    // Action
    const result = await getTool.execute({});
    const parsedResult = JSON.parse(result);
    
    // Assert
    expect(loadUserConfig).toHaveBeenCalled();
    expect(parsedResult.success).toBe(true);
    expect(parsedResult.config).toBeDefined();
    expect(parsedResult.config.templates.defaultVersion).toBe(5);
  });
  
  it('should update configuration settings', async () => {
    // Setup
    registerConfigTools(mcp as any);
    const updateTool = mcp.addTool.mock.calls.find(
      call => call[0].name === 'update_pinescript_config'
    )?.[0] as MockTool;
    
    if (!updateTool) {
      throw new Error('Tool not found');
    }
    
    const newConfig = {
      validation: {
        strictMode: true
      }
    };
    
    // Action
    const result = await updateTool.execute({ config: newConfig });
    const parsedResult = JSON.parse(result);
    
    // Assert
    expect(saveUserConfig).toHaveBeenCalledWith(newConfig);
    expect(parsedResult.success).toBe(true);
    expect(parsedResult.message).toContain('updated successfully');
    expect(parsedResult.config).toBeDefined();
  });
  
  it('should reset configuration to defaults', async () => {
    // Setup
    registerConfigTools(mcp as any);
    const resetTool = mcp.addTool.mock.calls.find(
      call => call[0].name === 'reset_pinescript_config'
    )?.[0] as MockTool;
    
    if (!resetTool) {
      throw new Error('Tool not found');
    }
    
    // Action
    const result = await resetTool.execute({});
    const parsedResult = JSON.parse(result);
    
    // Assert
    expect(resetConfig).toHaveBeenCalled();
    expect(parsedResult.success).toBe(true);
    expect(parsedResult.message).toContain('reset to defaults');
    expect(parsedResult.config).toBeDefined();
  });
  
  it('should get a specific configuration section', async () => {
    // Setup
    registerConfigTools(mcp as any);
    const getSectionTool = mcp.addTool.mock.calls.find(
      call => call[0].name === 'get_config_section'
    )?.[0] as MockTool;
    
    if (!getSectionTool) {
      throw new Error('Tool not found');
    }
    
    // Action
    const result = await getSectionTool.execute({ section: 'templates' });
    const parsedResult = JSON.parse(result);
    
    // Assert
    expect(loadUserConfig).toHaveBeenCalled();
    expect(parsedResult.success).toBe(true);
    expect(parsedResult.config).toBeDefined();
    expect(parsedResult.config.defaultVersion).toBe(5);
  });
  
  it('should return error when requesting invalid section', async () => {
    // Setup
    registerConfigTools(mcp as any);
    const getSectionTool = mcp.addTool.mock.calls.find(
      call => call[0].name === 'get_config_section'
    )?.[0] as MockTool;
    
    if (!getSectionTool) {
      throw new Error('Tool not found');
    }
    
    // Action
    const result = await getSectionTool.execute({ section: 'nonexistent' });
    const parsedResult = JSON.parse(result);
    
    // Assert
    expect(parsedResult.success).toBe(false);
    expect(parsedResult.message).toContain('not found');
    expect(parsedResult.availableSections).toBeDefined();
  });
  
  it('should set custom templates directory', async () => {
    // Setup
    registerConfigTools(mcp as any);
    const setDirectoryTool = mcp.addTool.mock.calls.find(
      call => call[0].name === 'set_templates_directory'
    )?.[0] as MockTool;
    
    if (!setDirectoryTool) {
      throw new Error('Tool not found');
    }
    
    // Action
    const result = await setDirectoryTool.execute({ directory: '/custom/path' });
    const parsedResult = JSON.parse(result);
    
    // Assert
    expect(saveUserConfig).toHaveBeenCalled();
    expect(parsedResult.success).toBe(true);
    expect(parsedResult.message).toContain('Templates directory set');
    expect(parsedResult.config).toBeDefined();
  });
}); 