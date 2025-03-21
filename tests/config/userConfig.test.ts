/**
 * Tests for user configuration system
 */

import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { 
  PineScriptConfig, 
  loadUserConfig, 
  saveUserConfig, 
  resetConfig 
} from '../../src/config/userConfig';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
}));

// Mock path module
jest.mock('path', () => ({
  join: jest.fn((a, b, c) => c ? `${a}/${b}/${c}` : `${a}/${b}`),
}));

// Mock os module
jest.mock('os', () => ({
  homedir: jest.fn(() => '/mock/home'),
}));

describe('PineScript User Configuration', () => {
  // Setup before each test
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default mock for path.join
    (path.join as jest.Mock).mockImplementation((a, b, c) => {
      if (c) return `${a}/${b}/${c}`;
      return b ? `${a}/${b}` : a;
    });
    
    // Default mock for os.homedir
    (os.homedir as jest.Mock).mockReturnValue('/mock/home');
    
    // Default fs.existsSync to return true
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    
    // Default mock implementation for fs.readFileSync
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      return JSON.stringify({
        templates: {
          defaultVersion: 5,
          customTemplatesDir: '/custom/templates'
        }
      });
    });
  });
  
  it('should load default configuration when no config file exists', () => {
    // Mock fs.existsSync to return false (config doesn't exist)
    (fs.existsSync as jest.Mock).mockReturnValueOnce(false).mockReturnValueOnce(false);
    
    const config = loadUserConfig();
    
    // Verify directory creation
    expect(fs.mkdirSync).toHaveBeenCalledWith('/mock/home/.pinescript-mcp', { recursive: true });
    expect(fs.mkdirSync).toHaveBeenCalledWith('/mock/home/.pinescript-mcp/versions', { recursive: true });
    
    // Verify default config values
    expect(config.templates.defaultVersion).toBe(5);
    expect(config.validation.strictMode).toBe(false);
    expect(config.errorFixer.autoFixEnabled).toBe(true);
    
    // Verify config file was written
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
  
  it('should load configuration from file when it exists', () => {
    const config = loadUserConfig();
    
    // Verify config was loaded from file
    expect(fs.readFileSync).toHaveBeenCalledWith('/mock/home/.pinescript-mcp/config.json', 'utf8');
    
    // Verify merged config values
    expect(config.templates.defaultVersion).toBe(5);
    expect(config.templates.customTemplatesDir).toBe('/custom/templates');
  });
  
  it('should save configuration updates', () => {
    // Setup
    const configUpdates = {
      templates: {
        defaultVersion: 6
      } as any,  // Type assertion to avoid TypeScript requiring all fields
      validation: {
        strictMode: true
      }
    };
    
    // Action
    const updatedConfig = saveUserConfig(configUpdates as Partial<PineScriptConfig>);
    
    // Verify config was loaded first
    expect(fs.readFileSync).toHaveBeenCalledWith('/mock/home/.pinescript-mcp/config.json', 'utf8');
    
    // Verify merged config was saved
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(updatedConfig.templates.defaultVersion).toBe(6);
    expect(updatedConfig.templates.customTemplatesDir).toBe('/custom/templates');
    expect(updatedConfig.validation.strictMode).toBe(true);
  });
  
  it('should reset configuration to defaults', () => {
    // Action
    const defaultConfig = resetConfig();
    
    // Verify config file was written with defaults
    expect(fs.writeFileSync).toHaveBeenCalled();
    
    // Verify default values
    expect(defaultConfig.templates.defaultVersion).toBe(5);
    expect(defaultConfig.templates.customTemplatesDir).toBe(null);
    expect(defaultConfig.validation.strictMode).toBe(false);
    expect(defaultConfig.errorFixer.autoFixEnabled).toBe(true);
  });
  
  it('should handle errors when loading configuration', () => {
    // Mock readFileSync to throw an error
    (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Mock file read error');
    });
    
    // Mock console.warn to prevent test output pollution
    const originalConsoleWarn = console.warn;
    console.warn = jest.fn();
    
    // Action
    const config = loadUserConfig();
    
    // Verify warning was logged
    expect(console.warn).toHaveBeenCalled();
    
    // Verify default config was returned
    expect(config.templates.defaultVersion).toBe(5);
    expect(config.templates.customTemplatesDir).toBe(null);
    
    // Restore console.warn
    console.warn = originalConsoleWarn;
  });
  
  it('should handle errors when saving configuration', () => {
    // Mock writeFileSync to throw an error
    (fs.writeFileSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Mock file write error');
    });
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Action
    const config = saveUserConfig({
      templates: {
        defaultVersion: 6
      } as any  // Type assertion to avoid TypeScript requiring all fields
    } as Partial<PineScriptConfig>);
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalled();
    
    // Verify current config was returned
    expect(config.templates.defaultVersion).toBe(5);
    
    // Restore console.error
    console.error = originalConsoleError;
  });
}); 