import { expect, jest, test } from '@jest/globals';
import { FastMCP } from 'fastmcp';
import { VersionManager } from '../../src/utils/versionManager.js';
import { PineScriptVersion } from '../../src/utils/versionDetector.js';

// Mock the FastMCP class and VersionManager class
jest.mock('fastmcp');
jest.mock('../../src/utils/versionManager.js');

// Define types for our mocks
interface ToolConfig {
  name: string;
  description?: string;
  parameters?: any;
  execute: (args: any) => Promise<string>;
}

describe('PineScript Version Management MCP Tools', () => {
  let mcp: jest.Mocked<FastMCP>;
  let versionManager: jest.Mocked<VersionManager>;
  let executeCallback: ((args: any) => Promise<string>) | null = null;
  let mockTools: Record<string, ToolConfig> = {};
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockTools = {};
    
    // Create mock for FastMCP with addTool method
    mcp = new FastMCP({
      name: 'Test MCP',
      version: '1.0.0'
    }) as jest.Mocked<FastMCP>;
    
    // Mock the addTool method
    mcp.addTool = jest.fn().mockImplementation((config: ToolConfig) => {
      mockTools[config.name] = config;
      if (config.name === 'convert_pinescript_version') {
        executeCallback = config.execute;
      }
    });
    
    // Create mock for VersionManager
    versionManager = new VersionManager() as jest.Mocked<VersionManager>;
    (versionManager.upgradeVersion as jest.Mock) = jest.fn().mockImplementation((script, targetVersion) => {
      return `// Converted to ${targetVersion}\n${script}`;
    });
    
    (versionManager.saveVersion as jest.Mock) = jest.fn().mockReturnValue('test-id-123');
    
    (versionManager.getVersionHistory as jest.Mock) = jest.fn().mockReturnValue([{
      id: 'test-id-123',
      timestamp: '2024-03-21T12:00:00.000Z',
      content: '//@version=5\nindicator("Test")',
      version: PineScriptVersion.V5,
      valid: true,
      notes: 'Test version'
    }]);
    
    (versionManager.compareVersions as jest.Mock) = jest.fn().mockReturnValue([
      '- oldLine',
      '+ newLine'
    ]);
  });
  
  test('should register version tools with MCP server', async () => {
    // Import the main module (this will execute the main function that registers the tools)
    await import('../../src/index.js');
    
    // Check that addTool was called the right number of times
    expect(mcp.addTool).toHaveBeenCalledTimes(7);
    
    // Check that tools were registered by looking at mock call arguments
    const toolNames = (mcp.addTool as jest.Mock).mock.calls.map(call => call[0].name);
    
    expect(toolNames).toContain('convert_pinescript_version');
    expect(toolNames).toContain('save_pinescript_version');
    expect(toolNames).toContain('get_pinescript_history');
    expect(toolNames).toContain('compare_pinescript_versions');
  });
  
  test('convert_pinescript_version should upgrade script to target version', async () => {
    // Import the main module
    await import('../../src/index.js');
    
    // Get the tool directly from our mock tools map
    const convertTool = mockTools['convert_pinescript_version'];
    expect(convertTool).toBeDefined();
    
    // Execute the tool
    const params = {
      script: '//@version=5\nindicator("Test")',
      target_version: PineScriptVersion.V6
    };
    
    const result = await convertTool.execute(params);
    const parsedResult = JSON.parse(result);
    
    // Check that the result contains the expected properties
    expect(parsedResult).toHaveProperty('convertedScript');
    expect(parsedResult).toHaveProperty('valid');
    expect(parsedResult).toHaveProperty('warnings');
    
    // Check that upgradeVersion was called with correct params
    expect(versionManager.upgradeVersion).toHaveBeenCalledWith(
      params.script,
      params.target_version
    );
  });
  
  test('save_pinescript_version should save a script version', async () => {
    // Import the main module
    await import('../../src/index.js');
    
    // Get the tool directly from our mock tools map
    const saveTool = mockTools['save_pinescript_version'];
    expect(saveTool).toBeDefined();
    
    // Execute the tool
    const params = {
      script: '//@version=5\nindicator("Test")',
      notes: 'Test version'
    };
    
    const result = await saveTool.execute(params);
    const parsedResult = JSON.parse(result);
    
    // Check that the result contains the expected properties
    expect(parsedResult).toHaveProperty('scriptId', 'test-id-123');
    expect(parsedResult).toHaveProperty('versionCount', 1);
    expect(parsedResult).toHaveProperty('latestVersion');
    expect(parsedResult.latestVersion).toHaveProperty('id', 'test-id-123');
    expect(parsedResult.latestVersion).toHaveProperty('notes', 'Test version');
    
    // Check that saveVersion was called with correct params
    expect(versionManager.saveVersion).toHaveBeenCalledWith(
      '//@version=5\nindicator("Test")',
      'Test version'
    );
  });
  
  test('compare_pinescript_versions should compare two scripts', async () => {
    // Import the main module
    await import('../../src/index.js');
    
    // Get the tool directly from our mock tools map
    const compareTool = mockTools['compare_pinescript_versions'];
    expect(compareTool).toBeDefined();
    
    // Execute the tool
    const params = {
      old_script: '//@version=5\nindicator("Old")',
      new_script: '//@version=5\nindicator("New")'
    };
    
    const result = await compareTool.execute(params);
    const parsedResult = JSON.parse(result);
    
    // Check that the result contains the expected properties
    expect(parsedResult).toHaveProperty('changeCount', 2);
    expect(parsedResult).toHaveProperty('changes');
    expect(parsedResult.changes).toEqual([
      '- oldLine',
      '+ newLine'
    ]);
    
    // Check that compareVersions was called with correct params
    expect(versionManager.compareVersions).toHaveBeenCalledWith(
      '//@version=5\nindicator("Old")',
      '//@version=5\nindicator("New")'
    );
  });
}); 