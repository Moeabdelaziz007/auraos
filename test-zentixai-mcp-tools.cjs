#!/usr/bin/env node

/**
 * Comprehensive Test Suite for ZentixAI-Inspired MCP Tools
 * Tests the new multilingual assistant, system designer, educational tutor, and wellness coach tools
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Testing ZentixAI-Inspired MCP Tools Integration');
console.log('==================================================\n');

// Test configuration
const SERVER_URL = 'http://localhost:3001';
const TEST_TIMEOUT = 30000; // 30 seconds

// Test cases for ZentixAI-inspired tools
const testCases = [
  // Multilingual Assistant Tests
  {
    tool: 'multilingual_assistant',
    name: 'Multilingual Assistant - Arabic Technical',
    params: {
      message: 'صمم لي نظام ذكاء اصطناعي لمتجر إلكتروني',
      language: 'arabic',
      context: 'Need a comprehensive e-commerce AI system'
    },
    expectedFields: ['detected_language', 'response_type', 'response', 'capabilities']
  },
  {
    tool: 'multilingual_assistant',
    name: 'Multilingual Assistant - English Education',
    params: {
      message: 'Explain quantum theory in simple terms',
      language: 'english',
      context: 'Beginner level explanation needed'
    },
    expectedFields: ['detected_language', 'response_type', 'response', 'capabilities']
  },
  {
    tool: 'multilingual_assistant',
    name: 'Multilingual Assistant - Wellness Support',
    params: {
      message: 'I feel anxious today and need help',
      language: 'auto',
      user_profile: { id: 'user123', name: 'John' }
    },
    expectedFields: ['detected_language', 'response_type', 'response', 'capabilities']
  },

  // System Designer Tests
  {
    tool: 'system_designer',
    name: 'System Designer - Simple E-commerce',
    params: {
      requirements: 'Build a simple e-commerce platform with user authentication, product catalog, and payment processing',
      complexity: 'simple',
      technology_stack: {
        frontend: 'React',
        backend: 'FastAPI',
        database: 'PostgreSQL'
      }
    },
    expectedFields: ['system_design', 'recommendations', 'estimated_development_time', 'technology_stack']
  },
  {
    tool: 'system_designer',
    name: 'System Designer - Enterprise Analytics',
    params: {
      requirements: 'Enterprise-level data analytics platform with real-time processing, machine learning, and multi-tenant architecture',
      complexity: 'enterprise',
      technology_stack: {
        frontend: 'React',
        backend: 'FastAPI',
        database: 'PostgreSQL'
      }
    },
    expectedFields: ['system_design', 'recommendations', 'estimated_development_time', 'technology_stack']
  },

  // Educational Tutor Tests
  {
    tool: 'educational_tutor',
    name: 'Educational Tutor - Beginner Python',
    params: {
      topic: 'Python Programming',
      difficulty_level: 'beginner',
      learning_style: 'visual',
      context: 'Complete beginner with no programming experience'
    },
    expectedFields: ['learning_content', 'personalized_recommendations', 'estimated_learning_time']
  },
  {
    tool: 'educational_tutor',
    name: 'Educational Tutor - Advanced Machine Learning',
    params: {
      topic: 'Machine Learning',
      difficulty_level: 'advanced',
      learning_style: 'kinesthetic',
      context: 'Experienced developer wanting to learn ML'
    },
    expectedFields: ['learning_content', 'personalized_recommendations', 'estimated_learning_time']
  },

  // Wellness Coach Tests
  {
    tool: 'wellness_coach',
    name: 'Wellness Coach - Stress Management',
    params: {
      mood: 'stressed',
      stress_level: 'high',
      goals: ['reduce stress', 'improve sleep', 'better work-life balance'],
      context: 'High-pressure job with long hours'
    },
    expectedFields: ['wellness_plan', 'personalized_recommendations', 'emergency_resources']
  },
  {
    tool: 'wellness_coach',
    name: 'Wellness Coach - Mood Enhancement',
    params: {
      mood: 'neutral',
      stress_level: 'low',
      goals: ['increase energy', 'boost creativity', 'maintain positivity'],
      context: 'Looking to improve overall well-being'
    },
    expectedFields: ['wellness_plan', 'personalized_recommendations', 'emergency_resources']
  }
];

// Utility functions
function makeRequest(tool, params) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    
    const postData = JSON.stringify({
      tool: tool,
      params: params
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/mcp/execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
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

async function runTest(testCase) {
  console.log(`🧪 Testing: ${testCase.name}`);
  console.log(`   Tool: ${testCase.tool}`);
  console.log(`   Params: ${JSON.stringify(testCase.params, null, 2)}`);
  
  try {
    const startTime = Date.now();
    const result = await makeRequest(testCase.tool, testCase.params);
    const executionTime = Date.now() - startTime;
    
    console.log(`   ✅ Result received`);
    console.log(`   Execution time: ${executionTime}ms`);
    console.log(`   Success: ${result.success}`);
    
    if (result.success) {
      // Check expected fields
      const missingFields = testCase.expectedFields.filter(field => !(field in result));
      if (missingFields.length === 0) {
        console.log(`   ✅ All expected fields present`);
      } else {
        console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
      }
      
      // Display key results
      if (result.detected_language) {
        console.log(`   Language: ${result.detected_language}`);
      }
      if (result.response_type) {
        console.log(`   Response Type: ${result.response_type}`);
      }
      if (result.complexity) {
        console.log(`   Complexity: ${result.complexity}`);
      }
      if (result.difficulty_level) {
        console.log(`   Difficulty: ${result.difficulty_level}`);
      }
      if (result.mood) {
        console.log(`   Mood: ${result.mood}`);
      }
      if (result.stress_level) {
        console.log(`   Stress Level: ${result.stress_level}`);
      }
      
      console.log(`   Capabilities: ${result.capabilities?.length || 0} items`);
    } else {
      console.log(`   ❌ Error: ${result.error}`);
    }
    
    console.log('   ---\n');
    return { success: result.success, executionTime, result };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    console.log('   ---\n');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('📡 Testing MCP Server Integration...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  let totalExecutionTime = 0;
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    if (result.success) {
      passedTests++;
      totalExecutionTime += result.executionTime || 0;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('📊 Test Results Summary:');
  console.log('========================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`⏱️  Total execution time: ${totalExecutionTime}ms`);
  console.log(`📈 Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All ZentixAI-inspired MCP tools tests passed!');
    console.log('\n🚀 ZentixAI Integration Features:');
    console.log('   • Multilingual Assistant (Arabic/English)');
    console.log('   • System Designer (Architecture Planning)');
    console.log('   • Educational Tutor (Adaptive Learning)');
    console.log('   • Wellness Coach (Mental Health Support)');
    console.log('\n✨ Your AuraOS system now has enhanced AI capabilities!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the MCP server configuration.');
  }
}

// Start MCP server and run tests
async function startMCPServer() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Starting MCP Server...');
    
    const serverProcess = spawn('npm', ['run', 'mcp-server'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    let serverReady = false;
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('AuraOS MCP Server started') && !serverReady) {
        serverReady = true;
        console.log('✅ MCP Server started successfully\n');
        resolve(serverProcess);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });
    
    serverProcess.on('error', (error) => {
      reject(error);
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!serverReady) {
        reject(new Error('MCP Server failed to start within timeout'));
      }
    }, 10000);
  });
}

// Main execution
async function main() {
  try {
    const serverProcess = await startMCPServer();
    
    // Wait a bit for server to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Run all tests
    await runAllTests();
    
    // Stop server
    console.log('\n🛑 Stopping MCP Server...');
    serverProcess.kill();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
main().catch(console.error);
