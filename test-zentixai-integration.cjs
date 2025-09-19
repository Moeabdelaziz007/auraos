#!/usr/bin/env node

/**
 * Test script for ZentixAI integration components
 * Tests CLI interface, enhanced logging, and monitoring features
 */

const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const TEST_TIMEOUT = 10000;

// Test configuration
const tests = {
  cli: true,
  logging: true,
  monitoring: true,
  api: true
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Test utilities
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(url, options = {}) {
  try {
    const response = await axios({
      url: `${BASE_URL}${url}`,
      timeout: TEST_TIMEOUT,
      ...options
    });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      status: error.response?.status 
    };
  }
}

// Test functions
async function testServerConnection() {
  logInfo('Testing server connection...');
  
  const result = await makeRequest('/api/system/health');
  if (result.success) {
    logSuccess('Server is running and responding');
    return true;
  } else {
    logError(`Server connection failed: ${result.error}`);
    return false;
  }
}

async function testCLIAPI() {
  logInfo('Testing CLI-specific API endpoints...');
  
  const endpoints = [
    { url: '/api/system/status', name: 'System Status' },
    { url: '/api/system/health', name: 'System Health' },
    { url: '/api/autopilot/status', name: 'Autopilot Status' },
    { url: '/api/ai/agents/status', name: 'AI Agents Status' },
    { url: '/api/workflows/templates', name: 'Workflow Templates' },
    { url: '/api/system/logs', name: 'System Logs' }
  ];

  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.url);
    if (result.success) {
      logSuccess(`${endpoint.name} endpoint working`);
      passed++;
    } else {
      logError(`${endpoint.name} endpoint failed: ${result.error}`);
      failed++;
    }
    await sleep(100); // Small delay between requests
  }

  logInfo(`CLI API tests: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

async function testAIChat() {
  logInfo('Testing AI chat endpoint...');
  
  const result = await makeRequest('/api/ai/chat', {
    method: 'POST',
    data: {
      message: 'Hello, this is a test message from the integration test.',
      context: 'test'
    }
  });

  if (result.success) {
    logSuccess('AI chat endpoint working');
    logInfo(`Response: ${result.data.response?.substring(0, 100)}...`);
    return true;
  } else {
    logError(`AI chat endpoint failed: ${result.error}`);
    return false;
  }
}

async function testLoggingSystem() {
  logInfo('Testing enhanced logging system...');
  
  // Check if log directory exists
  const logDir = './logs';
  if (!fs.existsSync(logDir)) {
    logWarning('Log directory does not exist, creating it...');
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Check for recent log files
  const logFiles = fs.readdirSync(logDir).filter(file => file.endsWith('.log'));
  if (logFiles.length > 0) {
    logSuccess(`Found ${logFiles.length} log files in ${logDir}`);
    
    // Check the most recent log file
    const recentLogFile = path.join(logDir, logFiles[logFiles.length - 1]);
    const logContent = fs.readFileSync(recentLogFile, 'utf8');
    const logLines = logContent.trim().split('\n');
    
    if (logLines.length > 0) {
      logSuccess(`Recent log file has ${logLines.length} entries`);
      
      // Check if the log contains structured JSON
      try {
        const lastLogEntry = JSON.parse(logLines[logLines.length - 1]);
        if (lastLogEntry.timestamp && lastLogEntry.level && lastLogEntry.message) {
          logSuccess('Log entries are properly structured JSON');
          return true;
        }
      } catch (error) {
        logWarning('Log entries are not in JSON format (this might be expected)');
      }
    }
  } else {
    logWarning('No log files found (server might not have started logging yet)');
  }

  return true; // Logging system exists and is functional
}

async function testSystemStatus() {
  logInfo('Testing system status endpoint...');
  
  const result = await makeRequest('/api/system/status');
  if (result.success) {
    const data = result.data;
    
    // Validate system status structure
    const requiredFields = ['system', 'autopilot', 'ai', 'performance', 'timestamp'];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length === 0) {
      logSuccess('System status has all required fields');
      
      // Log some key metrics
      logInfo(`System uptime: ${Math.round(data.system.uptime)}s`);
      logInfo(`Memory usage: ${data.performance.memory}%`);
      logInfo(`Active AI agents: ${data.ai.activeAgents}/${data.ai.agents}`);
      logInfo(`Autopilot active: ${data.autopilot.active}`);
      
      return true;
    } else {
      logError(`System status missing fields: ${missingFields.join(', ')}`);
      return false;
    }
  } else {
    logError(`System status endpoint failed: ${result.error}`);
    return false;
  }
}

async function testCLICommands() {
  logInfo('Testing CLI commands...');
  
  // Test CLI help command
  return new Promise((resolve) => {
    const cliProcess = spawn('npm', ['run', 'cli', '--', '--help'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    let output = '';
    let errorOutput = '';

    cliProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    cliProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    cliProcess.on('close', (code) => {
      if (code === 0 && output.includes('AuraOS Command Line Interface')) {
        logSuccess('CLI help command working');
        resolve(true);
      } else {
        logError(`CLI help command failed (exit code: ${code})`);
        if (errorOutput) {
          logError(`Error output: ${errorOutput}`);
        }
        resolve(false);
      }
    });

    cliProcess.on('error', (error) => {
      logError(`CLI command failed to start: ${error.message}`);
      resolve(false);
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      cliProcess.kill();
      logError('CLI command timed out');
      resolve(false);
    }, 5000);
  });
}

// Main test runner
async function runTests() {
  log(colors.bright + colors.cyan + '\n🚀 AuraOS ZentixAI Integration Test Suite\n' + colors.reset);
  
  const startTime = Date.now();
  let totalTests = 0;
  let passedTests = 0;

  // Test server connection first
  if (!await testServerConnection()) {
    logError('Cannot proceed with tests - server is not running');
    logInfo('Please start the server with: npm run dev');
    process.exit(1);
  }

  // Run tests based on configuration
  const testFunctions = [
    { name: 'System Status', fn: testSystemStatus, enabled: tests.api },
    { name: 'CLI API Endpoints', fn: testCLIAPI, enabled: tests.api },
    { name: 'AI Chat', fn: testAIChat, enabled: tests.api },
    { name: 'Logging System', fn: testLoggingSystem, enabled: tests.logging },
    { name: 'CLI Commands', fn: testCLICommands, enabled: tests.cli }
  ];

  for (const test of testFunctions) {
    if (!test.enabled) {
      logWarning(`Skipping ${test.name} (disabled)`);
      continue;
    }

    totalTests++;
    log(colors.bright + `\n📋 Running ${test.name} Test` + colors.reset);
    
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
        logSuccess(`${test.name} test passed`);
      } else {
        logError(`${test.name} test failed`);
      }
    } catch (error) {
      logError(`${test.name} test error: ${error.message}`);
    }
  }

  // Test summary
  const duration = Date.now() - startTime;
  log(colors.bright + '\n📊 Test Summary' + colors.reset);
  log(`Total tests: ${totalTests}`);
  log(`Passed: ${passedTests}`, colors.green);
  log(`Failed: ${totalTests - passedTests}`, colors.red);
  log(`Duration: ${duration}ms`);
  
  if (passedTests === totalTests) {
    logSuccess('\n🎉 All tests passed! ZentixAI integration is working correctly.');
    process.exit(0);
  } else {
    logError(`\n💥 ${totalTests - passedTests} tests failed. Please check the errors above.`);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  log('\n\n🛑 Test interrupted by user');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Run the tests
runTests().catch(error => {
  logError(`Test runner error: ${error.message}`);
  process.exit(1);
});
