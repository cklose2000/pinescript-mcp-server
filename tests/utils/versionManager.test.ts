import { VersionManager, ScriptVersion } from '../../src/utils/versionManager.js';
import { PineScriptVersion } from '../../src/utils/versionDetector.js';
import * as fs from 'fs';
import * as path from 'path';

// Create a temp directory for testing
const TEST_HISTORY_DIR = '.test_pinescript_history';

describe('PineScript Version Manager', () => {
  let versionManager: VersionManager;
  
  beforeEach(() => {
    // Create a new version manager instance for each test
    versionManager = new VersionManager(TEST_HISTORY_DIR);
  });
  
  afterEach(() => {
    // Clean up test directory after each test
    if (fs.existsSync(TEST_HISTORY_DIR)) {
      fs.rmSync(TEST_HISTORY_DIR, { recursive: true, force: true });
    }
  });
  
  it('should upgrade from v4 to v5', () => {
    // Given
    const v4Script = `//@version=4
study("My Script")
myRsi = rsi(close, 14)
myEma = ema(close, 20)
securityData = security(syminfo.tickerid, "D", close)
plot(myRsi, "RSI")
`;
    
    // When
    const result = versionManager.upgradeVersion(v4Script, PineScriptVersion.V5);
    
    // Then
    expect(result).toContain('//@version=5');
    expect(result).toContain('indicator("My Script")');
    expect(result).toContain('myRsi = ta.rsi(close, 14)');
    expect(result).toContain('myEma = ta.ema(close, 20)');
    expect(result).toContain('securityData = request.security(syminfo.tickerid, "D", close)');
  });
  
  it('should upgrade from v5 to v6', () => {
    // Given
    const v5Script = `//@version=5
indicator("My Indicator")
var counter = 0
var price = close
incrementer(x) => x + 1
myRsi = ta.rsi(close, 14)
plot(myRsi, "RSI")
`;
    
    // When
    const result = versionManager.upgradeVersion(v5Script, PineScriptVersion.V6);
    
    // Then
    expect(result).toContain('//@version=6');
    expect(result).toContain('import ta');
    expect(result).toContain('let price = close');
    expect(result).toContain('method incrementer');
  });
  
  it('should downgrade from v5 to v4', () => {
    // Given
    const v5Script = `//@version=5
indicator("My Indicator")
myRsi = ta.rsi(close, 14)
myEma = ta.ema(close, 20)
securityData = request.security(syminfo.tickerid, "D", close)
plot(myRsi, "RSI")
`;
    
    // When
    const result = versionManager.upgradeVersion(v5Script, PineScriptVersion.V4);
    
    // Then
    expect(result).toContain('//@version=4');
    expect(result).toContain('study("My Indicator")');
    expect(result).toContain('myRsi = rsi(close, 14)');
    expect(result).toContain('myEma = ema(close, 20)');
    expect(result).toContain('securityData = security(syminfo.tickerid, "D", close)');
  });
  
  it('should downgrade from v6 to v5', () => {
    // Given
    const v6Script = `//@version=6
indicator("My Indicator")
import ta
let price = close
var counter = 0
method incrementer(x) {
    x + 1
}
myRsi = ta.rsi(close, 14)
plot(series=myRsi, title="RSI", color=color.purple)
`;
    
    // When
    const result = versionManager.upgradeVersion(v6Script, PineScriptVersion.V5);
    
    // Then
    expect(result).toContain('//@version=5');
    expect(result).not.toContain('import ta');
    expect(result).toContain('var price = close');
    expect(result).toContain('incrementer(x) => {');
  });
  
  it('should save a version and generate an ID', () => {
    // Given
    const script = `//@version=5
indicator("Test Indicator")
myRsi = ta.rsi(close, 14)
plot(myRsi, "RSI")
`;
    
    // When
    const id = versionManager.saveVersion(script, 'Initial version');
    
    // Then
    expect(id).toBeDefined();
    expect(id.length).toBe(10);
    
    // Check that the file was saved
    const scriptDir = path.join(TEST_HISTORY_DIR, id);
    expect(fs.existsSync(scriptDir)).toBe(true);
    
    // Should have at least one .pine file and one .meta.json file
    const files = fs.readdirSync(scriptDir);
    expect(files.some(file => file.endsWith('.pine'))).toBe(true);
    expect(files.some(file => file.endsWith('.meta.json'))).toBe(true);
  });
  
  it('should retrieve version history', () => {
    // Given
    const script1 = `//@version=5
indicator("Version 1")
myRsi = ta.rsi(close, 14)
plot(myRsi, "RSI")
`;
    
    const script2 = `//@version=5
indicator("Version 2")
myRsi = ta.rsi(close, 14)
myEma = ta.ema(close, 20)
plot(myRsi, "RSI")
plot(myEma, "EMA")
`;
    
    // When
    const id = versionManager.saveVersion(script1, 'Version 1');
    versionManager.saveVersion(script2, 'Version 2');
    
    // Then
    const history = versionManager.getVersionHistory(id);
    expect(history.length).toBe(1);
    expect(history[0].notes).toBe('Version 1');
    expect(history[0].content).toBe(script1);
  });
  
  it('should compare two script versions', () => {
    // Given
    const oldScript = `//@version=5
indicator("Old Version")
length = input(14, "Length")
myRsi = ta.rsi(close, length)
plot(myRsi, "RSI")
`;
    
    const newScript = `//@version=5
indicator("New Version")
length = input(14, "Length")
oversold = input(30, "Oversold")
myRsi = ta.rsi(close, length)
plot(myRsi, "RSI")
hline(oversold, "Oversold")
`;
    
    // When
    const changes = versionManager.compareVersions(oldScript, newScript);
    
    // Then
    expect(changes.length).toBeGreaterThan(0);
    
    // Check for the specific changes
    const addedLines = changes.filter(change => change.startsWith('+ '));
    const removedLines = changes.filter(change => change.startsWith('- '));
    
    expect(addedLines.some(line => line.includes('New Version'))).toBe(true);
    expect(addedLines.some(line => line.includes('oversold = input'))).toBe(true);
    expect(addedLines.some(line => line.includes('hline'))).toBe(true);
    expect(removedLines.some(line => line.includes('Old Version'))).toBe(true);
  });
}); 