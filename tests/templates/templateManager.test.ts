import { getTemplate, TemplateType } from '../../src/templates/templateManager.js';

describe('PineScript Template Manager', () => {
  it('should return a strategy template', () => {
    // Given
    const name = 'Test Strategy';
    
    // When
    const template = getTemplate(TemplateType.STRATEGY, name);
    
    // Then
    expect(template).toContain(`strategy("${name}", overlay=true)`);
    // Just check for common elements that should be in all strategy templates
    expect(template).toContain('input(');
    expect(template).toContain('plot(');
  });
  
  it('should return an indicator template', () => {
    // Given
    const name = 'Test Indicator';
    
    // When
    const template = getTemplate(TemplateType.INDICATOR, name);
    
    // Then
    expect(template).toContain(`indicator("${name}"`);
    expect(template).toContain('length = input(');
    expect(template).toContain('plot(');
  });
  
  it('should throw an error for unknown template type', () => {
    // Given
    const invalidType = 'invalid' as TemplateType;
    const name = 'Test';
    
    // When & Then
    expect(() => {
      getTemplate(invalidType, name);
    }).toThrow('Unknown template type');
  });
  
  it('should return specific strategy templates by name', () => {
    // Test MA Cross template
    const maCrossTemplate = getTemplate(TemplateType.STRATEGY, 'ma cross');
    expect(maCrossTemplate).toContain('Moving Average Crossover Strategy');
    expect(maCrossTemplate).toContain('fastLength = input(9, "Fast MA Length")');
    
    // Test RSI strategy template
    const rsiTemplate = getTemplate(TemplateType.STRATEGY, 'rsi');
    expect(rsiTemplate).toContain('RSI Strategy');
    expect(rsiTemplate).toContain('rsiLength = input(14, "RSI Length")');
  });
  
  it('should return specific indicator templates by name', () => {
    // Test Bollinger Bands template
    const bollingerTemplate = getTemplate(TemplateType.INDICATOR, 'bollinger bands');
    expect(bollingerTemplate).toContain('Bollinger Bands');
    expect(bollingerTemplate).toContain('mult = input.float(2.0, "Std Dev Multiplier"');
    
    // Test MACD template
    const macdTemplate = getTemplate(TemplateType.INDICATOR, 'macd');
    expect(macdTemplate).toContain('MACD - Moving Average Convergence/Divergence');
    expect(macdTemplate).toContain('fastLength = input(12, "Fast Length")');
  });
}); 