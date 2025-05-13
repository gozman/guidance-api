/**
 * Example script demonstrating how to use the Guidance API instruction endpoints
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

// Load environment variables
config();

// API endpoint
const API_URL = 'http://localhost:3000';

/**
 * Get all instructions
 * @param {string} username - The username for login
 * @param {string} password - The password for login
 */
async function getInstructions(username, password) {
  try {
    const response = await fetch(`${API_URL}/instructions?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to retrieve instructions');
    }
    
    console.log('Instructions retrieved successfully!');
    console.log('Instructions:', data.data);
    
    return data;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Create a new instruction
 * @param {string} username - The username for login
 * @param {string} password - The password for login
 * @param {string} title - The title of the instruction
 * @param {string} content - The content of the instruction
 */
async function createInstruction(username, password, title, content) {
  try {
    const response = await fetch(`${API_URL}/instructions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        title,
        content,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create instruction');
    }
    
    console.log('Instruction created successfully!');
    console.log('Response:', data);
    
    return data;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Delete an instruction
 * @param {string} username - The username for login
 * @param {string} password - The password for login
 * @param {string} title - The title of the instruction to delete
 */
async function deleteInstruction(username, password, title) {
  try {
    const response = await fetch(`${API_URL}/instructions/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        title,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete instruction');
    }
    
    console.log('Instruction deleted successfully!');
    console.log('Response:', data);
    
    return data;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Delete all instructions
 * @param {string} username - The username for login
 * @param {string} password - The password for login
 */
async function deleteAllInstructions(username, password) {
  try {
    const response = await fetch(`${API_URL}/instructions/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete all instructions');
    }
    
    console.log('All instructions deleted successfully!');
    console.log('Response:', data);
    
    return data;
  } catch (error) {
    console.error('Error:', error.message);
  }
}


// Example usage
async function runExample() {
  // Use environment variables or fallback to defaults
  const username = process.env.AUTH_USERNAME || 'mike.gozzo@ada.support';
  const password = process.env.AUTH_PASSWORD || 'Cucuzza1983!';
  
  console.log('Example 1: Getting all instructions');
  await getInstructions(username, password);
  
  console.log('\n-----------------------------------\n');
  
  console.log('Example 2: Creating a new instruction');
  await createInstruction(username, password, 'Be concise', 'Provide short, direct answers without unnecessary details');
  
  console.log('\n-----------------------------------\n');
  
  console.log('Example 3: Getting updated instructions list');
  await getInstructions(username, password);
  
  console.log('\n-----------------------------------\n');
  
  console.log('Example 4: Deleting an instruction');
  await deleteInstruction(username, password, 'Be concise');
  
  console.log('\n-----------------------------------\n');
  
  console.log('Example 5: Verifying instruction was deleted');
  await getInstructions(username, password);
  
  console.log('\n-----------------------------------\n');
  
  console.log('Example 6: Creating multiple instructions');
  await createInstruction(username, password, 'Be creative', 'Think outside the box and provide innovative solutions');
  await createInstruction(username, password, 'Be helpful', 'Focus on providing practical assistance to the user');
  
  console.log('\n-----------------------------------\n');
  
  console.log('Example 7: Deleting all instructions');
  await deleteAllInstructions(username, password);
}

// Run the example
runExample().catch(console.error);

/**
 * You can also use curl to test the API:
 * 
 * Get instructions:
 * curl -X GET "http://localhost:3000/instructions?username=your_username&password=your_password"
 *
 * Create instruction:
 * curl -X POST http://localhost:3000/instructions \
 *   -H "Content-Type: application/json" \
 *   -d '{"username": "your_username", "password": "your_password", "title": "Be concise", "content": "Provide short, direct answers without unnecessary details"}'
 *
 * Delete instruction:
 * curl -X POST http://localhost:3000/instructions/delete \
 *   -H "Content-Type: application/json" \
 *   -d '{"username": "your_username", "password": "your_password", "title": "Be concise"}'
 * 
 * Delete all instructions:
 * curl -X POST http://localhost:3000/instructions/delete \
 *   -H "Content-Type: application/json" \
 *   -d '{"username": "your_username", "password": "your_password"}'
 */
