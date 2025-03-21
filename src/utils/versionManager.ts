/**
 * PineScript Version Manager
 * 
 * This utility manages versions of PineScript code, including upgrading, downgrading,
 * and tracking change history for scripts.
 */

import { PineScriptVersion, detectVersion } from './versionDetector.js';
import { validatePineScript } from '../validators/syntaxValidator.js';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Represents a version history entry for a script
 */
export interface ScriptVersion {
  id: string;
  timestamp: string;
  content: string;
  version: PineScriptVersion;
  notes?: string;
  valid: boolean;
}

/**
 * Manages PineScript version history and upgrades
 */
export class VersionManager {
  private historyDir: string;
  private cache: Map<string, ScriptVersion[]> = new Map();
  
  /**
   * Creates a new version manager
   * 
   * @param historyDir Directory for storing version history
   */
  constructor(historyDir: string = '.pinescript_history') {
    this.historyDir = historyDir;
    this.ensureHistoryDir();
  }
  
  /**
   * Updates version identifier in PineScript code
   * 
   * @param script Original PineScript code
   * @param targetVersion Target PineScript version
   * @returns Updated script with correct version identifier
   */
  upgradeVersion(script: string, targetVersion: PineScriptVersion): string {
    const currentVersion = detectVersion(script);
    
    // If already at target version, return as is
    if (currentVersion === targetVersion) {
      return script;
    }
    
    // Replace version identifier
    let updatedScript = script;
    if (script.includes('//@version=')) {
      updatedScript = script.replace(/\/\/@version=[0-9]/, `//@version=${targetVersion.charAt(1)}`);
    } else {
      // Insert version at the beginning if missing
      updatedScript = `//@version=${targetVersion.charAt(1)}\n${script}`;
    }
    
    // Apply version-specific transformations
    if (currentVersion === PineScriptVersion.V4 && targetVersion === PineScriptVersion.V5) {
      updatedScript = this.upgradeV4toV5(updatedScript);
    } else if (currentVersion === PineScriptVersion.V5 && targetVersion === PineScriptVersion.V6) {
      updatedScript = this.upgradeV5toV6(updatedScript);
    } else if (currentVersion === PineScriptVersion.V5 && targetVersion === PineScriptVersion.V4) {
      updatedScript = this.downgradeV5toV4(updatedScript);
    } else if (currentVersion === PineScriptVersion.V6 && targetVersion === PineScriptVersion.V5) {
      updatedScript = this.downgradeV6toV5(updatedScript);
    }
    
    return updatedScript;
  }
  
  /**
   * Saves a script version to history
   * 
   * @param script The PineScript code
   * @param notes Optional notes about this version
   * @returns The script identifier
   */
  saveVersion(script: string, notes?: string): string {
    const version = detectVersion(script);
    const id = this.generateScriptId(script);
    const validation = validatePineScript(script, version);
    
    const scriptVersion: ScriptVersion = {
      id,
      timestamp: new Date().toISOString(),
      content: script,
      version,
      valid: validation.valid,
      notes
    };
    
    // Add to in-memory cache
    const history = this.cache.get(id) || [];
    history.push(scriptVersion);
    this.cache.set(id, history);
    
    // Save to disk
    this.saveVersionToDisk(scriptVersion);
    
    return id;
  }
  
  /**
   * Gets version history for a script
   * 
   * @param scriptId The script identifier
   * @returns Array of script versions
   */
  getVersionHistory(scriptId: string): ScriptVersion[] {
    // Check memory cache first
    if (this.cache.has(scriptId)) {
      return this.cache.get(scriptId) || [];
    }
    
    // Otherwise load from disk
    const history = this.loadHistoryFromDisk(scriptId);
    this.cache.set(scriptId, history);
    return history;
  }
  
  /**
   * Gets a specific version of a script
   * 
   * @param scriptId The script identifier
   * @param index The version index (default is the latest)
   * @returns The script version or undefined if not found
   */
  getVersion(scriptId: string, index: number = -1): ScriptVersion | undefined {
    const history = this.getVersionHistory(scriptId);
    if (history.length === 0) {
      return undefined;
    }
    
    // Default to latest version
    if (index < 0) {
      return history[history.length - 1];
    }
    
    // Get specific version
    if (index < history.length) {
      return history[index];
    }
    
    return undefined;
  }
  
  /**
   * Compares two versions of a script and returns the differences
   * 
   * @param oldScript The old script content
   * @param newScript The new script content
   * @returns Differences between the scripts
   */
  compareVersions(oldScript: string, newScript: string): string[] {
    const oldLines = oldScript.split('\n');
    const newLines = newScript.split('\n');
    const changes: string[] = [];
    
    // Simple line-by-line comparison
    // A more sophisticated diff algorithm could be implemented
    const maxLines = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLines; i++) {
      if (i >= oldLines.length) {
        changes.push(`+ ${newLines[i]}`);
      } else if (i >= newLines.length) {
        changes.push(`- ${oldLines[i]}`);
      } else if (oldLines[i] !== newLines[i]) {
        changes.push(`- ${oldLines[i]}`);
        changes.push(`+ ${newLines[i]}`);
      }
    }
    
    return changes;
  }
  
  /**
   * Upgrades PineScript v4 to v5
   */
  private upgradeV4toV5(script: string): string {
    let result = script;
    
    // Replace study() with indicator()
    result = result.replace(/\bstudy\(/g, 'indicator(');
    
    // Replace security() with request.security()
    result = result.replace(/\bsecurity\(/g, 'request.security(');
    
    // Replace functions with ta namespace
    const taFunctions = ['sma', 'ema', 'rsi', 'macd', 'stoch', 'bb', 'cci', 'atr'];
    taFunctions.forEach(func => {
      // Use regex to replace only function calls, not part of other identifiers
      const regex = new RegExp(`\\b${func}\\(`, 'g');
      result = result.replace(regex, `ta.${func}(`);
    });
    
    return result;
  }
  
  /**
   * Upgrades PineScript v5 to v6
   */
  private upgradeV5toV6(script: string): string {
    let result = script;
    
    // Add import statements if missing
    if (!result.includes('import ta')) {
      result = result.replace(/\/\/@version=6/, '//@version=6\nimport ta');
    }
    
    // Convert var to let for non-mutable variables
    const lines = result.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip comments and empty lines
      if (line.startsWith('//') || line === '') {
        continue;
      }
      
      // Check if the line declares a variable with `var` that's not modified later
      if (line.startsWith('var ') && !line.includes(':=')) {
        const varName = line.substring(4).split('=')[0].trim();
        
        // Check if this variable is modified later (using :=)
        let isModified = false;
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].includes(`${varName} :=`) || lines[j].includes(`${varName}:=`)) {
            isModified = true;
            break;
          }
        }
        
        // If not modified, convert var to let
        if (!isModified) {
          lines[i] = lines[i].replace('var ', 'let ');
        }
      }
    }
    
    result = lines.join('\n');
    
    // Convert arrow functions to method syntax
    // This is a simplified approach - a full implementation would need more sophisticated parsing
    result = result.replace(/(\w+)\s*\(([^)]*)\)\s*=>/g, 'method $1($2)');
    
    return result;
  }
  
  /**
   * Downgrades PineScript v5 to v4
   */
  private downgradeV5toV4(script: string): string {
    let result = script;
    
    // Replace indicator() with study()
    result = result.replace(/\bindicator\(/g, 'study(');
    
    // Replace request.security() with security()
    result = result.replace(/\brequest\.security\(/g, 'security(');
    
    // Replace ta namespace functions
    const taFunctions = ['sma', 'ema', 'rsi', 'macd', 'stoch', 'bb', 'cci', 'atr'];
    taFunctions.forEach(func => {
      // Use regex to replace only function calls in ta namespace
      const regex = new RegExp(`\\bta\\.${func}\\(`, 'g');
      result = result.replace(regex, `${func}(`);
    });
    
    return result;
  }
  
  /**
   * Downgrades PineScript v6 to v5
   */
  private downgradeV6toV5(script: string): string {
    let result = script;
    
    // Remove import statements
    result = result.replace(/\nimport ta\b.*$/gm, '');
    
    // Convert let to var
    result = result.replace(/\blet\s+/g, 'var ');
    
    // Convert method syntax to arrow functions
    // This is a simplified approach
    result = result.replace(/\bmethod\s+(\w+)\s*\(([^)]*)\)\s*{/g, '$1($2) => {');
    
    return result;
  }
  
  /**
   * Generates a unique ID for a script
   */
  private generateScriptId(script: string): string {
    const hash = crypto.createHash('md5').update(script).digest('hex');
    return hash.substring(0, 10);
  }
  
  /**
   * Ensures the history directory exists
   */
  private ensureHistoryDir(): void {
    if (!fs.existsSync(this.historyDir)) {
      fs.mkdirSync(this.historyDir, { recursive: true });
    }
  }
  
  /**
   * Saves a script version to disk
   */
  private saveVersionToDisk(version: ScriptVersion): void {
    const scriptDir = path.join(this.historyDir, version.id);
    
    // Create directory for this script if it doesn't exist
    if (!fs.existsSync(scriptDir)) {
      fs.mkdirSync(scriptDir, { recursive: true });
    }
    
    // Generate a filename based on timestamp
    const timestamp = version.timestamp.replace(/[:.]/g, '-');
    const filename = path.join(scriptDir, `${timestamp}.pine`);
    
    // Save the script content
    fs.writeFileSync(filename, version.content);
    
    // Save metadata
    const metadata = {
      id: version.id,
      timestamp: version.timestamp,
      version: version.version,
      valid: version.valid,
      notes: version.notes
    };
    
    const metaFilename = path.join(scriptDir, `${timestamp}.meta.json`);
    fs.writeFileSync(metaFilename, JSON.stringify(metadata, null, 2));
  }
  
  /**
   * Loads script history from disk
   */
  private loadHistoryFromDisk(scriptId: string): ScriptVersion[] {
    const scriptDir = path.join(this.historyDir, scriptId);
    
    if (!fs.existsSync(scriptDir)) {
      return [];
    }
    
    const history: ScriptVersion[] = [];
    
    // Get all .pine files in the directory
    const files = fs.readdirSync(scriptDir)
      .filter(file => file.endsWith('.pine'))
      .sort(); // Sort to get chronological order
    
    for (const file of files) {
      const pineFile = path.join(scriptDir, file);
      const metaFile = pineFile.replace('.pine', '.meta.json');
      
      if (fs.existsSync(metaFile)) {
        try {
          const content = fs.readFileSync(pineFile, 'utf8');
          const metadata = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
          
          const version: ScriptVersion = {
            id: metadata.id,
            timestamp: metadata.timestamp,
            content,
            version: metadata.version,
            valid: metadata.valid,
            notes: metadata.notes
          };
          
          history.push(version);
        } catch (error) {
          console.error(`Error loading script version: ${error}`);
        }
      }
    }
    
    return history;
  }
} 