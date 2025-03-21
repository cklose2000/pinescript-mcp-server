import { detectVersion, PineScriptVersion } from '../../src/utils/versionDetector.js';

describe('PineScript Version Detector', () => {
  it('should detect version 4', () => {
    // Given
    const script = `//@version=4
study("My Script")
`;
    
    // When
    const version = detectVersion(script);
    
    // Then
    expect(version).toBe(PineScriptVersion.V4);
  });
  
  it('should detect version 5', () => {
    // Given
    const script = `//@version=5
indicator("My Indicator")
`;
    
    // When
    const version = detectVersion(script);
    
    // Then
    expect(version).toBe(PineScriptVersion.V5);
  });
  
  it('should detect version 6', () => {
    // Given
    const script = `//@version=6
indicator("My Indicator")
`;
    
    // When
    const version = detectVersion(script);
    
    // Then
    expect(version).toBe(PineScriptVersion.V6);
  });
  
  it('should default to version 5 when no version is specified', () => {
    // Given
    const script = `indicator("My Indicator")`;
    
    // When
    const version = detectVersion(script);
    
    // Then
    expect(version).toBe(PineScriptVersion.V5);
  });
}); 