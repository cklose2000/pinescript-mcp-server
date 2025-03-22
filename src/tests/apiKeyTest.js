// Test for API key loading
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Function to test API key
async function testApiKey() {
  console.log("Testing API key loading...");
  
  // Get the API key from environment
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error("ERROR: No API key found in environment variables");
    return;
  }
  
  console.log("API key from environment:", apiKey.substring(0, 10) + "...");
  console.log("API key length:", apiKey.length);
  
  try {
    // Test initialization of OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.openai.com/v1",
    });
    
    console.log("OpenAI client initialized successfully");
    
    // Test API connection with a simple completions request
    console.log("Testing API connection...");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, OpenAI!" }],
      max_tokens: 5
    });
    
    console.log("API connection successful!");
    console.log("Response:", response.choices[0]?.message?.content);
  } catch (error) {
    console.error("API connection error:", error);
    
    // If there's a status code, log it
    if (error.status) {
      console.error(`Status code: ${error.status}`);
    }
    
    // If there's error details, log them
    if (error.error) {
      console.error("Error details:", error.error);
    }
  }
}

// Run the test
testApiKey(); 