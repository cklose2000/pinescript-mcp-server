// Fix API Key script
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

// Function to extract API key from .env file manually
function extractApiKey() {
  try {
    // Read the .env file content
    const envPath = path.resolve('.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Find the OpenAI API key line
    const lines = envContent.split('\n');
    let apiKeyLine = '';
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('OPENAI_API_KEY=')) {
        // Start collecting from this line
        apiKeyLine = lines[i];
        
        // If the line ends with a backslash or the next line doesn't start with #,
        // keep appending the following lines
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith('#') && lines[j].trim() !== '') {
          apiKeyLine += lines[j].trim();
          j++;
        }
        
        break;
      }
    }
    
    // Extract the API key
    if (apiKeyLine) {
      const apiKey = apiKeyLine.substring(apiKeyLine.indexOf('=') + 1).trim();
      return apiKey;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting API key:', error);
    return null;
  }
}

// Test the API key extraction
async function testApiKey() {
  console.log('Extracting API key manually...');
  const apiKey = extractApiKey();
  
  if (!apiKey) {
    console.error('Failed to extract API key from .env file');
    return;
  }
  
  console.log('Extracted API key:', apiKey.substring(0, 15) + '...');
  console.log('API key length:', apiKey.length);
  
  // Save the API key to a temporary file
  const tempFilePath = path.resolve('./tempkey.txt');
  fs.writeFileSync(tempFilePath, apiKey);
  console.log('API key saved to temporary file for inspection');
  
  // Test with OpenAI client
  try {
    console.log('Testing with OpenAI client...');
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    console.log('OpenAI client initialized');
    
    // Simple test request
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say hello' }],
      max_tokens: 10
    });
    
    console.log('API request successful!');
    console.log('Response:', response.choices[0]?.message?.content);
  } catch (error) {
    console.error('API request failed:', error);
    if (error.status) {
      console.log('Status code:', error.status);
    }
    if (error.error) {
      console.log('Error details:', error.error);
    }
  }
}

// Run the test
testApiKey(); 