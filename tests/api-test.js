/**
 * Simple test script for the Instructions API
 * 
 * This script tests the basic functionality of the API by:
 * 1. Starting the server
 * 2. Making a request to the root endpoint
 * 3. Making requests to the instructions endpoints
 * 4. Shutting down the server
 */

import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const API_PORT = 3000;
const API_URL = `http://localhost:${API_PORT}`;
const SERVER_START_TIMEOUT = 5000; // 5 seconds

console.log('=== Instructions API Test ===');

// Start the server as a child process
console.log('Starting server...');
const serverProcess = spawn('node', [path.join(__dirname, '../src/index.js')], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, PORT: API_PORT }
});

// Log server output
serverProcess.stdout.on('data', (data) => {
  console.log(`[Server]: ${data.toString().trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`[Server Error]: ${data.toString().trim()}`);
});

// Function to make a GET request
function makeGetRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Function to make a POST request
function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(responseData)
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Wait for server to start
setTimeout(async () => {
  try {
    // Test 1: Root endpoint
    console.log('\nTest 1: GET /');
    const rootResponse = await makeGetRequest(API_URL);
    console.log(`Status Code: ${rootResponse.statusCode}`);
    assert.equal(rootResponse.statusCode, 200, 'Root endpoint should return 200 OK');
    assert.equal(typeof rootResponse.body.message, 'string', 'Response should contain a message');
    assert.ok(Array.isArray(rootResponse.body.endpoints), 'Response should contain endpoints array');
    console.log('✅ Test 1 passed');

    // Test 2: GET /instructions endpoint
    console.log('\nTest 2: GET /instructions');
    const instructionsResponse = await makeGetRequest(`${API_URL}/instructions?username=test&password=test`);
    console.log(`Status Code: ${instructionsResponse.statusCode}`);
    assert.equal(instructionsResponse.statusCode, 200, 'Instructions endpoint should return 200 OK');
    assert.equal(instructionsResponse.body.success, true, 'Response should indicate success');
    assert.ok(Array.isArray(instructionsResponse.body.data), 'Response should contain an array of instructions');
    console.log('✅ Test 2 passed');

    // Test 3: POST /instructions endpoint
    console.log('\nTest 3: POST /instructions');
    const createInstructionResponse = await makePostRequest(`${API_URL}/instructions`, {
      username: 'test',
      password: 'test',
      title: 'Test Instruction',
      content: 'This is a test instruction'
    });
    console.log(`Status Code: ${createInstructionResponse.statusCode}`);
    assert.equal(createInstructionResponse.statusCode, 200, 'Create instruction endpoint should return 200 OK');
    assert.equal(createInstructionResponse.body.success, true, 'Response should indicate success');
    assert.ok(createInstructionResponse.body.message, 'Response should contain a success message');
    console.log('✅ Test 3 passed');

    // Test 4: POST /instructions/delete endpoint
    console.log('\nTest 4: POST /instructions/delete');
    const deleteInstructionResponse = await makePostRequest(`${API_URL}/instructions/delete`, {
      username: 'test',
      password: 'test',
      title: 'Test Instruction'
    });
    console.log(`Status Code: ${deleteInstructionResponse.statusCode}`);
    assert.equal(deleteInstructionResponse.statusCode, 200, 'Delete instruction endpoint should return 200 OK');
    assert.equal(deleteInstructionResponse.body.success, true, 'Response should indicate success');
    assert.ok(deleteInstructionResponse.body.message, 'Response should contain a success message');
    console.log('✅ Test 4 passed');

    // Test 5: Error handling - missing title
    console.log('\nTest 5: Error handling - missing title');
    const missingTitleResponse = await makePostRequest(`${API_URL}/instructions`, {
      username: 'test',
      password: 'test',
      content: 'This is a test instruction'
    });
    console.log(`Status Code: ${missingTitleResponse.statusCode}`);
    assert.equal(missingTitleResponse.statusCode, 400, 'Should return 400 Bad Request for missing title');
    assert.ok(missingTitleResponse.body.error, 'Response should contain error message');
    console.log('✅ Test 5 passed');

    // Test 6: Error handling - missing content
    console.log('\nTest 6: Error handling - missing content');
    const missingContentResponse = await makePostRequest(`${API_URL}/instructions`, {
      username: 'test',
      password: 'test',
      title: 'Test Instruction'
    });
    console.log(`Status Code: ${missingContentResponse.statusCode}`);
    assert.equal(missingContentResponse.statusCode, 400, 'Should return 400 Bad Request for missing content');
    assert.ok(missingContentResponse.body.error, 'Response should contain error message');
    console.log('✅ Test 6 passed');

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    // Shutdown the server
    console.log('\nShutting down server...');
    serverProcess.kill();
    console.log('Test completed');
  }
}, SERVER_START_TIMEOUT);

// Handle process termination
process.on('SIGINT', () => {
  serverProcess.kill();
  process.exit();
});
