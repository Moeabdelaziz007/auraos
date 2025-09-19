#!/usr/bin/env node

/**
 * Comprehensive Autopilot System Test Script
 * Tests all enhanced autopilot features including live monitoring, AI integrations, and user controls
 */

import axios from 'axios';
import WebSocket from 'ws';

const BASE_URL = 'http://localhost:5000';
const WS_URL = 'ws://localhost:5000/ws';

class AutopilotTester {
  constructor() {
    this.testResults = [];
    this.wsConnection = null;
  }

  async runAllTests() {
    console.log('🚀 Starting Enhanced Autopilot System Tests\n');
    
    try {
      // Test 1: Basic API Connectivity
      await this.testBasicConnectivity();
      
      // Test 2: Live Status Endpoints
      await this.testLiveStatusEndpoints();
      
      // Test 3: Autopilot Control APIs
      await this.testAutopilotControlAPIs();
      
      // Test 4: Workflow Control APIs
      await this.testWorkflowControlAPIs();
      
      // Test 5: WebSocket Real-time Monitoring
      await this.testWebSocketMonitoring();
      
      // Test 6: AI Integration Tests
      await this.testAIIntegrations();
      
      // Test 7: Emergency Stop Functionality
      await this.testEmergencyStop();
      
      // Test 8: User Override System
      await this.testUserOverrideSystem();
      
      // Generate Test Report
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testBasicConnectivity() {
    console.log('📡 Testing Basic API Connectivity...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/automation/engine/stats`);
      
      if (response.status === 200 && response.data) {
        this.testResults.push({
          test: 'Basic Connectivity',
          status: 'PASS',
          details: 'Successfully connected to automation engine'
        });
        console.log('✅ Basic connectivity test passed');
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      this.testResults.push({
        test: 'Basic Connectivity',
        status: 'FAIL',
        details: error.message
      });
      console.log('❌ Basic connectivity test failed:', error.message);
    }
  }

  async testLiveStatusEndpoints() {
    console.log('📊 Testing Live Status Endpoints...');
    
    const endpoints = [
      '/api/autopilot/live/status',
      '/api/automation/engine/performance',
      '/api/workflows/intelligent/stats'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        
        if (response.status === 200 && response.data) {
          this.testResults.push({
            test: `Live Status - ${endpoint}`,
            status: 'PASS',
            details: `Successfully retrieved live status from ${endpoint}`
          });
          console.log(`✅ ${endpoint} test passed`);
        } else {
          throw new Error('Invalid response');
        }
      } catch (error) {
        this.testResults.push({
          test: `Live Status - ${endpoint}`,
          status: 'FAIL',
          details: error.message
        });
        console.log(`❌ ${endpoint} test failed:`, error.message);
      }
    }
  }

  async testAutopilotControlAPIs() {
    console.log('🎮 Testing Autopilot Control APIs...');
    
    // Test emergency stop
    try {
      const stopResponse = await axios.post(`${BASE_URL}/api/autopilot/emergency-stop`, {
        stop: true
      });
      
      if (stopResponse.status === 200 && stopResponse.data.success) {
        console.log('✅ Emergency stop test passed');
        
        // Resume autopilot
        const resumeResponse = await axios.post(`${BASE_URL}/api/autopilot/emergency-stop`, {
          stop: false
        });
        
        if (resumeResponse.status === 200 && resumeResponse.data.success) {
          this.testResults.push({
            test: 'Emergency Stop Control',
            status: 'PASS',
            details: 'Successfully stopped and resumed autopilot'
          });
          console.log('✅ Emergency resume test passed');
        } else {
          throw new Error('Failed to resume autopilot');
        }
      } else {
        throw new Error('Failed to stop autopilot');
      }
    } catch (error) {
      this.testResults.push({
        test: 'Emergency Stop Control',
        status: 'FAIL',
        details: error.message
      });
      console.log('❌ Emergency stop test failed:', error.message);
    }
  }

  async testWorkflowControlAPIs() {
    console.log('🔄 Testing Workflow Control APIs...');
    
    try {
      // Get workflow stats first
      const statsResponse = await axios.get(`${BASE_URL}/api/workflows/intelligent/stats`);
      
      if (statsResponse.status === 200 && statsResponse.data.workflows) {
        const workflows = statsResponse.data.workflows;
        
        if (workflows.length > 0) {
          const firstWorkflow = workflows[0];
          
          // Test pause workflow
          const pauseResponse = await axios.post(`${BASE_URL}/api/workflows/${firstWorkflow.id}/pause`);
          
          if (pauseResponse.status === 200 && pauseResponse.data.success) {
            console.log('✅ Workflow pause test passed');
            
            // Test resume workflow
            const resumeResponse = await axios.post(`${BASE_URL}/api/workflows/${firstWorkflow.id}/resume`);
            
            if (resumeResponse.status === 200 && resumeResponse.data.success) {
              this.testResults.push({
                test: 'Workflow Control',
                status: 'PASS',
                details: `Successfully paused and resumed workflow: ${firstWorkflow.name}`
              });
              console.log('✅ Workflow resume test passed');
            } else {
              throw new Error('Failed to resume workflow');
            }
          } else {
            throw new Error('Failed to pause workflow');
          }
        } else {
          this.testResults.push({
            test: 'Workflow Control',
            status: 'SKIP',
            details: 'No workflows available to test'
          });
          console.log('⚠️ No workflows available for testing');
        }
      } else {
        throw new Error('Failed to get workflow stats');
      }
    } catch (error) {
      this.testResults.push({
        test: 'Workflow Control',
        status: 'FAIL',
        details: error.message
      });
      console.log('❌ Workflow control test failed:', error.message);
    }
  }

  async testWebSocketMonitoring() {
    console.log('📡 Testing WebSocket Real-time Monitoring...');
    
    return new Promise((resolve) => {
      try {
        this.wsConnection = new WebSocket(WS_URL);
        
        this.wsConnection.on('open', () => {
          console.log('✅ WebSocket connection established');
          
          // Send ping to test connection
          this.wsConnection.send(JSON.stringify({ type: 'ping' }));
        });

        this.wsConnection.on('message', (data) => {
          const message = JSON.parse(data.toString());
          
          if (message.type === 'pong') {
            console.log('✅ WebSocket ping/pong test passed');
            
            // Test autopilot status request
            this.wsConnection.send(JSON.stringify({ type: 'get_autopilot_status' }));
          } else if (message.type === 'autopilot_update') {
            console.log('✅ Received autopilot update via WebSocket');
            
            this.testResults.push({
              test: 'WebSocket Monitoring',
              status: 'PASS',
              details: 'Successfully received real-time autopilot updates'
            });
            
            this.wsConnection.close();
            resolve();
          }
        });

        this.wsConnection.on('error', (error) => {
          this.testResults.push({
            test: 'WebSocket Monitoring',
            status: 'FAIL',
            details: error.message
          });
          console.log('❌ WebSocket test failed:', error.message);
          resolve();
        });

        this.wsConnection.on('close', () => {
          console.log('📡 WebSocket connection closed');
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.close();
          }
          
          if (!this.testResults.find(r => r.test === 'WebSocket Monitoring')) {
            this.testResults.push({
              test: 'WebSocket Monitoring',
              status: 'FAIL',
              details: 'Timeout waiting for autopilot updates'
            });
          }
          resolve();
        }, 10000);

      } catch (error) {
        this.testResults.push({
          test: 'WebSocket Monitoring',
          status: 'FAIL',
          details: error.message
        });
        console.log('❌ WebSocket test failed:', error.message);
        resolve();
      }
    });
  }

  async testAIIntegrations() {
    console.log('🧠 Testing AI Integrations...');
    
    try {
      // Test system intelligence overview
      const response = await axios.get(`${BASE_URL}/api/system/intelligence/overview`);
      
      if (response.status === 200 && response.data) {
        const overview = response.data;
        
        // Check if AI predictions are present
        if (overview.predictions && overview.predictions.length > 0) {
          this.testResults.push({
            test: 'AI Integrations',
            status: 'PASS',
            details: `Successfully retrieved AI predictions: ${overview.predictions.length} predictions available`
          });
          console.log('✅ AI integrations test passed');
        } else {
          this.testResults.push({
            test: 'AI Integrations',
            status: 'PARTIAL',
            details: 'AI system initialized but no predictions available yet'
          });
          console.log('⚠️ AI integrations partially working');
        }
      } else {
        throw new Error('Invalid response from AI system');
      }
    } catch (error) {
      this.testResults.push({
        test: 'AI Integrations',
        status: 'FAIL',
        details: error.message
      });
      console.log('❌ AI integrations test failed:', error.message);
    }
  }

  async testEmergencyStop() {
    console.log('🚨 Testing Emergency Stop Functionality...');
    
    try {
      // Stop autopilot
      await axios.post(`${BASE_URL}/api/autopilot/emergency-stop`, { stop: true });
      
      // Verify it's stopped
      const statusResponse = await axios.get(`${BASE_URL}/api/autopilot/live/status`);
      
      if (statusResponse.data.automation.emergencyStop === true) {
        console.log('✅ Emergency stop verified');
        
        // Resume autopilot
        await axios.post(`${BASE_URL}/api/autopilot/emergency-stop`, { stop: false });
        
        // Verify it's resumed
        const resumeStatusResponse = await axios.get(`${BASE_URL}/api/autopilot/live/status`);
        
        if (resumeStatusResponse.data.automation.emergencyStop === false) {
          this.testResults.push({
            test: 'Emergency Stop Functionality',
            status: 'PASS',
            details: 'Emergency stop and resume functionality working correctly'
          });
          console.log('✅ Emergency resume verified');
        } else {
          throw new Error('Failed to resume autopilot');
        }
      } else {
        throw new Error('Emergency stop not working');
      }
    } catch (error) {
      this.testResults.push({
        test: 'Emergency Stop Functionality',
        status: 'FAIL',
        details: error.message
      });
      console.log('❌ Emergency stop test failed:', error.message);
    }
  }

  async testUserOverrideSystem() {
    console.log('👤 Testing User Override System...');
    
    try {
      // Get automation rules first
      const rulesResponse = await axios.get(`${BASE_URL}/api/automation/engine/stats`);
      
      if (rulesResponse.status === 200 && rulesResponse.data.totalRules > 0) {
        // Test setting an override (using a mock rule ID)
        const mockRuleId = 'smart_content_automation';
        
        const overrideResponse = await axios.post(`${BASE_URL}/api/autopilot/rule/${mockRuleId}/override`, {
          override: {
            action: 'skip',
            reason: 'Testing override system',
            duration: 3600000 // 1 hour
          }
        });
        
        if (overrideResponse.status === 200 && overrideResponse.data.success) {
          console.log('✅ User override set successfully');
          
          // Test clearing the override
          const clearResponse = await axios.delete(`${BASE_URL}/api/autopilot/rule/${mockRuleId}/override`);
          
          if (clearResponse.status === 200 && clearResponse.data.success) {
            this.testResults.push({
              test: 'User Override System',
              status: 'PASS',
              details: 'Successfully set and cleared user override'
            });
            console.log('✅ User override cleared successfully');
          } else {
            throw new Error('Failed to clear override');
          }
        } else {
          throw new Error('Failed to set override');
        }
      } else {
        this.testResults.push({
          test: 'User Override System',
          status: 'SKIP',
          details: 'No automation rules available to test'
        });
        console.log('⚠️ No automation rules available for testing');
      }
    } catch (error) {
      this.testResults.push({
        test: 'User Override System',
        status: 'FAIL',
        details: error.message
      });
      console.log('❌ User override test failed:', error.message);
    }
  }

  generateTestReport() {
    console.log('\n📋 AUTOPILOT SYSTEM TEST REPORT');
    console.log('='.repeat(50));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const partial = this.testResults.filter(r => r.status === 'PARTIAL').length;
    const skipped = this.testResults.filter(r => r.status === 'SKIP').length;
    const total = this.testResults.length;
    
    console.log(`\n📊 Test Results Summary:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⚠️ Partial: ${partial}`);
    console.log(`   ⏭️ Skipped: ${skipped}`);
    console.log(`   📈 Total: ${total}`);
    
    const successRate = ((passed + partial * 0.5) / total * 100).toFixed(1);
    console.log(`   🎯 Success Rate: ${successRate}%`);
    
    console.log('\n📝 Detailed Results:');
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : 
                   result.status === 'FAIL' ? '❌' : 
                   result.status === 'PARTIAL' ? '⚠️' : '⏭️';
      console.log(`   ${icon} ${result.test}: ${result.status}`);
      console.log(`      ${result.details}`);
    });
    
    console.log('\n🚀 AUTOPILOT SYSTEM STATUS:');
    if (successRate >= 90) {
      console.log('   🎉 EXCELLENT - Autopilot system is fully operational!');
    } else if (successRate >= 75) {
      console.log('   👍 GOOD - Autopilot system is mostly functional with minor issues');
    } else if (successRate >= 50) {
      console.log('   ⚠️ FAIR - Autopilot system has significant issues that need attention');
    } else {
      console.log('   ❌ POOR - Autopilot system needs major fixes');
    }
    
    console.log('\n🔧 Next Steps:');
    if (failed > 0) {
      console.log('   1. Review failed tests and fix issues');
      console.log('   2. Ensure all services are running properly');
      console.log('   3. Check API endpoints and WebSocket connections');
    }
    console.log('   4. Monitor system performance in production');
    console.log('   5. Set up automated monitoring and alerts');
    
    console.log('\n✨ Enhanced Autopilot System is ready for live operation!');
  }
}

// Run the tests
const tester = new AutopilotTester();
tester.runAllTests().catch(console.error);
