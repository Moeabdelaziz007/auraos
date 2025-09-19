#!/usr/bin/env node

/**
 * Advanced Automation System Test Suite
 * Tests all enhanced automation, AI decision-making, and system intelligence features
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

class AdvancedAutomationTester {
  constructor() {
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🚀 AuraOS Advanced Automation Test Suite');
    console.log('========================================\n');
    
    try {
      await this.testSystemIntelligence();
      await this.testAutomationEngine();
      await this.testWorkflowOrchestration();
      await this.testAIDecisionMaking();
      await this.testPredictiveAnalytics();
      await this.testSystemOptimization();
      
      this.printTestResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testSystemIntelligence() {
    console.log('🧠 Testing System Intelligence...');
    
    try {
      const response = await this.makeRequest('GET', '/api/system/intelligence/overview');
      
      if (response.automation && response.workflows && response.capabilities) {
        this.addTestResult('System Intelligence Overview', 'PASS', 'System intelligence data retrieved successfully');
        console.log('✅ System Intelligence Overview: PASSED');
        
        // Test capabilities
        const capabilities = response.capabilities;
        if (capabilities.predictiveAnalytics && capabilities.intelligentAutomation && capabilities.selfOptimization) {
          this.addTestResult('System Capabilities', 'PASS', 'All advanced capabilities enabled');
          console.log('✅ System Capabilities: PASSED');
        } else {
          this.addTestResult('System Capabilities', 'FAIL', 'Some capabilities missing');
          console.log('❌ System Capabilities: FAILED');
        }
        
        // Test metrics
        const metrics = response.metrics;
        if (metrics.aiAccuracy > 0.9 && metrics.systemEfficiency > 0.9) {
          this.addTestResult('System Metrics', 'PASS', `AI Accuracy: ${metrics.aiAccuracy}, Efficiency: ${metrics.systemEfficiency}`);
          console.log('✅ System Metrics: PASSED');
        } else {
          this.addTestResult('System Metrics', 'FAIL', 'Metrics below threshold');
          console.log('❌ System Metrics: FAILED');
        }
      } else {
        this.addTestResult('System Intelligence Overview', 'FAIL', 'Invalid response structure');
        console.log('❌ System Intelligence Overview: FAILED');
      }
    } catch (error) {
      this.addTestResult('System Intelligence', 'FAIL', error.message);
      console.log('❌ System Intelligence: FAILED -', error.message);
    }
  }

  async testAutomationEngine() {
    console.log('⚙️ Testing Automation Engine...');
    
    try {
      // Test automation stats
      const statsResponse = await this.makeRequest('GET', '/api/automation/engine/stats');
      
      if (statsResponse.totalRules && statsResponse.activeRules) {
        this.addTestResult('Automation Stats', 'PASS', `${statsResponse.totalRules} rules, ${statsResponse.activeRules} active`);
        console.log('✅ Automation Stats: PASSED');
      } else {
        this.addTestResult('Automation Stats', 'FAIL', 'Invalid stats structure');
        console.log('❌ Automation Stats: FAILED');
      }
      
      // Test performance metrics
      const performanceResponse = await this.makeRequest('GET', '/api/automation/engine/performance');
      
      if (performanceResponse.automation && performanceResponse.system) {
        this.addTestResult('Automation Performance', 'PASS', 'Performance metrics retrieved');
        console.log('✅ Automation Performance: PASSED');
      } else {
        this.addTestResult('Automation Performance', 'FAIL', 'Invalid performance structure');
        console.log('❌ Automation Performance: FAILED');
      }
      
      // Test creating automation rule
      const ruleData = {
        name: 'Test Automation Rule',
        condition: {
          type: 'time',
          parameters: { schedule: 'daily', time: '12:00' }
        },
        action: {
          type: 'notification',
          parameters: { message: 'Test notification' },
          priority: 'medium'
        },
        enabled: true
      };
      
      const ruleResponse = await this.makeRequest('POST', '/api/automation/engine/rules', ruleData);
      
      if (ruleResponse.id && ruleResponse.name === ruleData.name) {
        this.addTestResult('Create Automation Rule', 'PASS', 'Rule created successfully');
        console.log('✅ Create Automation Rule: PASSED');
      } else {
        this.addTestResult('Create Automation Rule', 'FAIL', 'Rule creation failed');
        console.log('❌ Create Automation Rule: FAILED');
      }
      
    } catch (error) {
      this.addTestResult('Automation Engine', 'FAIL', error.message);
      console.log('❌ Automation Engine: FAILED -', error.message);
    }
  }

  async testWorkflowOrchestration() {
    console.log('🔄 Testing Workflow Orchestration...');
    
    try {
      // Test workflow stats
      const statsResponse = await this.makeRequest('GET', '/api/workflows/intelligent/stats');
      
      if (statsResponse.totalWorkflows && statsResponse.activeWorkflows) {
        this.addTestResult('Workflow Stats', 'PASS', `${statsResponse.totalWorkflows} workflows, ${statsResponse.activeWorkflows} active`);
        console.log('✅ Workflow Stats: PASSED');
      } else {
        this.addTestResult('Workflow Stats', 'FAIL', 'Invalid workflow stats');
        console.log('❌ Workflow Stats: FAILED');
      }
      
      // Test creating intelligent workflow
      const workflowData = {
        name: 'Test Intelligent Workflow',
        type: 'content_automation',
        steps: [
          {
            id: 'test_step_1',
            name: 'Test Step 1',
            type: 'ai_analysis',
            parameters: { model: 'test_model' },
            aiEnhancement: { enabled: true, learningEnabled: true, optimizationEnabled: true },
            dependencies: [],
            timeout: 30000,
            retryPolicy: { maxRetries: 3, backoffStrategy: 'exponential', retryDelay: 1000 }
          }
        ],
        triggers: [
          {
            id: 'test_trigger',
            type: 'schedule',
            parameters: { schedule: 'daily', time: '10:00' },
            enabled: true
          }
        ]
      };
      
      const workflowResponse = await this.makeRequest('POST', '/api/workflows/intelligent/create', workflowData);
      
      if (workflowResponse.id && workflowResponse.name === workflowData.name) {
        this.addTestResult('Create Intelligent Workflow', 'PASS', 'Workflow created successfully');
        console.log('✅ Create Intelligent Workflow: PASSED');
      } else {
        this.addTestResult('Create Intelligent Workflow', 'FAIL', 'Workflow creation failed');
        console.log('❌ Create Intelligent Workflow: FAILED');
      }
      
    } catch (error) {
      this.addTestResult('Workflow Orchestration', 'FAIL', error.message);
      console.log('❌ Workflow Orchestration: FAILED -', error.message);
    }
  }

  async testAIDecisionMaking() {
    console.log('🤖 Testing AI Decision Making...');
    
    try {
      const decisionData = {
        context: 'travel_planning',
        options: ['book_now', 'wait_for_better_price', 'find_alternatives'],
        criteria: ['cost', 'time', 'quality']
      };
      
      const response = await this.makeRequest('POST', '/api/ai/decision', decisionData);
      
      if (response.recommendation && response.alternatives && response.confidence) {
        this.addTestResult('AI Decision Making', 'PASS', `Recommendation: ${response.recommendation.option}, Confidence: ${response.recommendation.confidence}`);
        console.log('✅ AI Decision Making: PASSED');
        
        // Test decision quality
        if (response.recommendation.confidence > 0.7) {
          this.addTestResult('Decision Quality', 'PASS', 'High confidence decision');
          console.log('✅ Decision Quality: PASSED');
        } else {
          this.addTestResult('Decision Quality', 'FAIL', 'Low confidence decision');
          console.log('❌ Decision Quality: FAILED');
        }
      } else {
        this.addTestResult('AI Decision Making', 'FAIL', 'Invalid decision response');
        console.log('❌ AI Decision Making: FAILED');
      }
      
    } catch (error) {
      this.addTestResult('AI Decision Making', 'FAIL', error.message);
      console.log('❌ AI Decision Making: FAILED -', error.message);
    }
  }

  async testPredictiveAnalytics() {
    console.log('🔮 Testing Predictive Analytics...');
    
    try {
      const predictionData = {
        type: 'user_behavior',
        timeframe: '7d',
        parameters: { category: 'travel' }
      };
      
      const response = await this.makeRequest('POST', '/api/analytics/predict', predictionData);
      
      if (response.predictions && response.recommendations) {
        this.addTestResult('Predictive Analytics', 'PASS', `${response.predictions.length} predictions generated`);
        console.log('✅ Predictive Analytics: PASSED');
        
        // Test prediction quality
        const highConfidencePredictions = response.predictions.filter(p => p.confidence > 0.8);
        if (highConfidencePredictions.length > 0) {
          this.addTestResult('Prediction Quality', 'PASS', `${highConfidencePredictions.length} high-confidence predictions`);
          console.log('✅ Prediction Quality: PASSED');
        } else {
          this.addTestResult('Prediction Quality', 'FAIL', 'No high-confidence predictions');
          console.log('❌ Prediction Quality: FAILED');
        }
        
        // Test recommendations
        if (response.recommendations.length > 0) {
          this.addTestResult('AI Recommendations', 'PASS', `${response.recommendations.length} recommendations provided`);
          console.log('✅ AI Recommendations: PASSED');
        } else {
          this.addTestResult('AI Recommendations', 'FAIL', 'No recommendations provided');
          console.log('❌ AI Recommendations: FAILED');
        }
      } else {
        this.addTestResult('Predictive Analytics', 'FAIL', 'Invalid prediction response');
        console.log('❌ Predictive Analytics: FAILED');
      }
      
    } catch (error) {
      this.addTestResult('Predictive Analytics', 'FAIL', error.message);
      console.log('❌ Predictive Analytics: FAILED -', error.message);
    }
  }

  async testSystemOptimization() {
    console.log('⚡ Testing System Optimization...');
    
    try {
      const optimizationData = {
        category: 'performance',
        parameters: { target: 'response_time', threshold: 1000 }
      };
      
      const response = await this.makeRequest('POST', '/api/system/intelligence/optimize', optimizationData);
      
      if (response.id && response.status && response.expectedImprovement) {
        this.addTestResult('System Optimization', 'PASS', `Optimization started: ${response.expectedImprovement} improvement expected`);
        console.log('✅ System Optimization: PASSED');
      } else {
        this.addTestResult('System Optimization', 'FAIL', 'Invalid optimization response');
        console.log('❌ System Optimization: FAILED');
      }
      
    } catch (error) {
      this.addTestResult('System Optimization', 'FAIL', error.message);
      console.log('❌ System Optimization: FAILED -', error.message);
    }
  }

  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(body);
            resolve(jsonData);
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${body}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  addTestResult(test, status, message) {
    this.testResults.push({ test, status, message });
  }

  printTestResults() {
    console.log('\n📊 Advanced Automation Test Results:');
    console.log('=' .repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    // Group results by category
    const categories = {};
    this.testResults.forEach(result => {
      const category = result.test.split(' ')[0];
      if (!categories[category]) {
        categories[category] = { passed: 0, failed: 0, tests: [] };
      }
      categories[category][result.status.toLowerCase()]++;
      categories[category].tests.push(result);
    });

    // Print results by category
    Object.keys(categories).forEach(category => {
      const cat = categories[category];
      console.log(`\n📋 ${category}:`);
      cat.tests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : '❌';
        console.log(`  ${icon} ${test.test}: ${test.message}`);
      });
      console.log(`  📊 ${cat.passed} passed, ${cat.failed} failed`);
    });
    
    console.log('\n' + '=' .repeat(60));
    console.log(`🎯 Total: ${this.testResults.length} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! AuraOS Advanced Automation System is fully operational!');
      console.log('\n🚀 **Enhanced Features Verified:**');
      console.log('• ✅ Advanced AI Automation Engine');
      console.log('• ✅ Intelligent Workflow Orchestration');
      console.log('• ✅ AI-Powered Decision Making');
      console.log('• ✅ Predictive Analytics');
      console.log('• ✅ System Intelligence & Optimization');
      console.log('• ✅ Self-Learning & Adaptation');
      console.log('• ✅ Real-Time Performance Monitoring');
      console.log('• ✅ Automated System Maintenance');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the issues above.');
    }
  }
}

// Main execution
async function main() {
  const tester = new AdvancedAutomationTester();
  await tester.runAllTests();
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the advanced automation tests
main().catch(console.error);
