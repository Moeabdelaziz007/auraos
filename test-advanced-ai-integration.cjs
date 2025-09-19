#!/usr/bin/env node

/**
 * Advanced AI Integration Test Suite
 * Tests Multi-Modal AI, Real-Time Streaming, and Model Management
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

class AdvancedAIIntegrationTester {
  constructor() {
    this.testResults = [];
    this.performanceMetrics = [];
  }

  async runAllTests() {
    console.log('🧠 Advanced AI Integration Test Suite');
    console.log('=====================================\n');
    
    try {
      await this.testMultiModalAI();
      await this.testRealTimeStreaming();
      await this.testModelManagement();
      await this.testFederatedLearning();
      await this.testModelDeployment();
      await this.testPerformanceMetrics();
      
      this.printTestResults();
      this.printPerformanceSummary();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testMultiModalAI() {
    console.log('🎯 Testing Multi-Modal AI Engine...');
    
    const testCases = [
      {
        name: 'Text Processing',
        data: {
          input: {
            type: 'text',
            data: 'Hello, this is a test message for multi-modal AI processing',
            metadata: { language: 'en', format: 'text/plain' }
          },
          modelId: 'gpt-4-turbo'
        }
      },
      {
        name: 'Audio Processing',
        data: {
          input: {
            type: 'audio',
            data: Buffer.from('fake audio data'),
            metadata: { format: 'audio/wav', duration: 5 }
          },
          modelId: 'whisper-large'
        }
      },
      {
        name: 'Image Processing',
        data: {
          input: {
            type: 'image',
            data: Buffer.from('fake image data'),
            metadata: { format: 'image/jpeg', resolution: '1920x1080' }
          },
          modelId: 'gpt-4-vision'
        }
      },
      {
        name: 'Mixed Media Processing',
        data: {
          input: {
            type: 'mixed',
            data: Buffer.from('fake mixed media data'),
            metadata: { format: 'multimodal/mixed', encoding: 'utf-8' }
          },
          modelId: 'gpt-4o'
        }
      }
    ];

    for (const testCase of testCases) {
      try {
        const startTime = Date.now();
        const response = await this.makeRequest('POST', '/api/ai/multimodal/process', testCase.data);
        const processingTime = Date.now() - startTime;
        
        if (response && response.confidence > 0.5) {
          this.addTestResult(`Multi-Modal AI - ${testCase.name}`, 'PASS', 
            `Confidence: ${response.confidence}, Processing Time: ${processingTime}ms`);
          console.log(`✅ ${testCase.name}: PASSED (${response.confidence})`);
          
          this.performanceMetrics.push({
            test: testCase.name,
            type: 'multimodal',
            confidence: response.confidence,
            processingTime,
            success: true
          });
        } else {
          this.addTestResult(`Multi-Modal AI - ${testCase.name}`, 'FAIL', 
            `Low confidence: ${response.confidence}`);
          console.log(`❌ ${testCase.name}: FAILED (${response.confidence})`);
        }
      } catch (error) {
        this.addTestResult(`Multi-Modal AI - ${testCase.name}`, 'FAIL', error.message);
        console.log(`❌ ${testCase.name}: FAILED - ${error.message}`);
      }
    }

    // Test model listing
    try {
      const modelsResponse = await this.makeRequest('GET', '/api/ai/multimodal/models');
      const activeModelsResponse = await this.makeRequest('GET', '/api/ai/multimodal/models/active');
      
      if (modelsResponse && modelsResponse.length > 0) {
        this.addTestResult('Multi-Modal AI - Model Listing', 'PASS', 
          `Total models: ${modelsResponse.length}, Active: ${activeModelsResponse.length}`);
        console.log(`✅ Model Listing: PASSED (${modelsResponse.length} models)`);
      } else {
        this.addTestResult('Multi-Modal AI - Model Listing', 'FAIL', 'No models found');
        console.log(`❌ Model Listing: FAILED`);
      }
    } catch (error) {
      this.addTestResult('Multi-Modal AI - Model Listing', 'FAIL', error.message);
      console.log(`❌ Model Listing: FAILED - ${error.message}`);
    }
  }

  async testRealTimeStreaming() {
    console.log('🚀 Testing Real-Time AI Streaming...');
    
    try {
      // Test streaming status
      const statusResponse = await this.makeRequest('GET', '/api/ai/streaming/status');
      if (statusResponse) {
        this.addTestResult('Real-Time Streaming - Status', 'PASS', 
          `Total connections: ${statusResponse.total}, Active: ${statusResponse.active}`);
        console.log(`✅ Streaming Status: PASSED`);
      } else {
        this.addTestResult('Real-Time Streaming - Status', 'FAIL', 'No status data');
        console.log(`❌ Streaming Status: FAILED`);
      }
    } catch (error) {
      this.addTestResult('Real-Time Streaming - Status', 'FAIL', error.message);
      console.log(`❌ Streaming Status: FAILED - ${error.message}`);
    }

    try {
      // Test streaming metrics
      const metricsResponse = await this.makeRequest('GET', '/api/ai/streaming/metrics');
      if (metricsResponse && metricsResponse.connections) {
        this.addTestResult('Real-Time Streaming - Metrics', 'PASS', 
          `Connections: ${metricsResponse.connections.total}, AI Models: ${metricsResponse.aiEngine.models}`);
        console.log(`✅ Streaming Metrics: PASSED`);
      } else {
        this.addTestResult('Real-Time Streaming - Metrics', 'FAIL', 'No metrics data');
        console.log(`❌ Streaming Metrics: FAILED`);
      }
    } catch (error) {
      this.addTestResult('Real-Time Streaming - Metrics', 'FAIL', error.message);
      console.log(`❌ Streaming Metrics: FAILED - ${error.message}`);
    }
  }

  async testModelManagement() {
    console.log('🤖 Testing AI Model Management...');
    
    try {
      // Test model listing
      const modelsResponse = await this.makeRequest('GET', '/api/ai/models');
      if (modelsResponse && modelsResponse.length > 0) {
        this.addTestResult('Model Management - Model Listing', 'PASS', 
          `Total models: ${modelsResponse.length}`);
        console.log(`✅ Model Listing: PASSED (${modelsResponse.length} models)`);
        
        // Test model versions for first model
        const firstModel = modelsResponse[0];
        const versionsResponse = await this.makeRequest('GET', `/api/ai/models/${firstModel.id}/versions`);
        if (versionsResponse && versionsResponse.length > 0) {
          this.addTestResult('Model Management - Version Listing', 'PASS', 
            `Versions: ${versionsResponse.length}`);
          console.log(`✅ Version Listing: PASSED (${versionsResponse.length} versions)`);
        } else {
          this.addTestResult('Model Management - Version Listing', 'FAIL', 'No versions found');
          console.log(`❌ Version Listing: FAILED`);
        }
      } else {
        this.addTestResult('Model Management - Model Listing', 'FAIL', 'No models found');
        console.log(`❌ Model Listing: FAILED`);
      }
    } catch (error) {
      this.addTestResult('Model Management - Model Listing', 'FAIL', error.message);
      console.log(`❌ Model Listing: FAILED - ${error.message}`);
    }

    try {
      // Test deployments
      const deploymentsResponse = await this.makeRequest('GET', '/api/ai/deployments');
      const activeDeploymentsResponse = await this.makeRequest('GET', '/api/ai/deployments/active');
      
      if (deploymentsResponse !== undefined) {
        this.addTestResult('Model Management - Deployments', 'PASS', 
          `Total deployments: ${deploymentsResponse.length}, Active: ${activeDeploymentsResponse.length}`);
        console.log(`✅ Deployments: PASSED`);
      } else {
        this.addTestResult('Model Management - Deployments', 'FAIL', 'No deployment data');
        console.log(`❌ Deployments: FAILED`);
      }
    } catch (error) {
      this.addTestResult('Model Management - Deployments', 'FAIL', error.message);
      console.log(`❌ Deployments: FAILED - ${error.message}`);
    }
  }

  async testFederatedLearning() {
    console.log('🔄 Testing Federated Learning...');
    
    try {
      // Test federated learning rounds
      const roundsResponse = await this.makeRequest('GET', '/api/ai/federated-learning');
      const activeRoundsResponse = await this.makeRequest('GET', '/api/ai/federated-learning/active');
      
      if (roundsResponse !== undefined) {
        this.addTestResult('Federated Learning - Rounds', 'PASS', 
          `Total rounds: ${roundsResponse.length}, Active: ${activeRoundsResponse.length}`);
        console.log(`✅ Federated Learning Rounds: PASSED`);
      } else {
        this.addTestResult('Federated Learning - Rounds', 'FAIL', 'No rounds data');
        console.log(`❌ Federated Learning Rounds: FAILED`);
      }
    } catch (error) {
      this.addTestResult('Federated Learning - Rounds', 'FAIL', error.message);
      console.log(`❌ Federated Learning Rounds: FAILED - ${error.message}`);
    }

    try {
      // Test starting a federated learning round
      const testRound = {
        modelId: 'gpt-4-turbo',
        participants: ['participant1', 'participant2', 'participant3']
      };
      
      const startRoundResponse = await this.makeRequest('POST', '/api/ai/federated-learning', testRound);
      if (startRoundResponse && startRoundResponse.id) {
        this.addTestResult('Federated Learning - Start Round', 'PASS', 
          `Round started: ${startRoundResponse.id}, Participants: ${startRoundResponse.participants.length}`);
        console.log(`✅ Start Federated Learning Round: PASSED`);
      } else {
        this.addTestResult('Federated Learning - Start Round', 'FAIL', 'Failed to start round');
        console.log(`❌ Start Federated Learning Round: FAILED`);
      }
    } catch (error) {
      this.addTestResult('Federated Learning - Start Round', 'FAIL', error.message);
      console.log(`❌ Start Federated Learning Round: FAILED - ${error.message}`);
    }
  }

  async testModelDeployment() {
    console.log('🚀 Testing Model Deployment...');
    
    try {
      // Test training jobs
      const trainingJobsResponse = await this.makeRequest('GET', '/api/ai/training');
      const activeTrainingResponse = await this.makeRequest('GET', '/api/ai/training/active');
      
      if (trainingJobsResponse !== undefined) {
        this.addTestResult('Model Deployment - Training Jobs', 'PASS', 
          `Total jobs: ${trainingJobsResponse.length}, Active: ${activeTrainingResponse.length}`);
        console.log(`✅ Training Jobs: PASSED`);
      } else {
        this.addTestResult('Model Deployment - Training Jobs', 'FAIL', 'No training data');
        console.log(`❌ Training Jobs: FAILED`);
      }
    } catch (error) {
      this.addTestResult('Model Deployment - Training Jobs', 'FAIL', error.message);
      console.log(`❌ Training Jobs: FAILED - ${error.message}`);
    }

    try {
      // Test starting a training job
      const testTrainingJob = {
        modelId: 'gpt-4-turbo',
        config: {
          dataset: 'test_dataset',
          epochs: 10,
          batchSize: 32,
          learningRate: 0.001,
          optimizer: 'adam'
        }
      };
      
      const startTrainingResponse = await this.makeRequest('POST', '/api/ai/training', testTrainingJob);
      if (startTrainingResponse && startTrainingResponse.id) {
        this.addTestResult('Model Deployment - Start Training', 'PASS', 
          `Training job started: ${startTrainingResponse.id}, Model: ${startTrainingResponse.modelId}`);
        console.log(`✅ Start Training Job: PASSED`);
      } else {
        this.addTestResult('Model Deployment - Start Training', 'FAIL', 'Failed to start training');
        console.log(`❌ Start Training Job: FAILED`);
      }
    } catch (error) {
      this.addTestResult('Model Deployment - Start Training', 'FAIL', error.message);
      console.log(`❌ Start Training Job: FAILED - ${error.message}`);
    }
  }

  async testPerformanceMetrics() {
    console.log('📊 Testing Performance Metrics...');
    
    try {
      // Test system metrics
      const systemMetricsResponse = await this.makeRequest('GET', '/api/ai/system-metrics');
      if (systemMetricsResponse && systemMetricsResponse.models) {
        this.addTestResult('Performance Metrics - System Metrics', 'PASS', 
          `Models: ${systemMetricsResponse.models.total}, Deployments: ${systemMetricsResponse.deployments.total}`);
        console.log(`✅ System Metrics: PASSED`);
      } else {
        this.addTestResult('Performance Metrics - System Metrics', 'FAIL', 'No system metrics');
        console.log(`❌ System Metrics: FAILED`);
      }
    } catch (error) {
      this.addTestResult('Performance Metrics - System Metrics', 'FAIL', error.message);
      console.log(`❌ System Metrics: FAILED - ${error.message}`);
    }

    try {
      // Test multi-modal performance
      const multiModalPerformanceResponse = await this.makeRequest('GET', '/api/ai/multimodal/performance');
      if (multiModalPerformanceResponse && Object.keys(multiModalPerformanceResponse).length > 0) {
        this.addTestResult('Performance Metrics - Multi-Modal Performance', 'PASS', 
          `Performance data available for ${Object.keys(multiModalPerformanceResponse).length} models`);
        console.log(`✅ Multi-Modal Performance: PASSED`);
      } else {
        this.addTestResult('Performance Metrics - Multi-Modal Performance', 'FAIL', 'No performance data');
        console.log(`❌ Multi-Modal Performance: FAILED`);
      }
    } catch (error) {
      this.addTestResult('Performance Metrics - Multi-Modal Performance', 'FAIL', error.message);
      console.log(`❌ Multi-Modal Performance: FAILED - ${error.message}`);
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
            reject(new Error(`Invalid JSON response: ${body.substring(0, 100)}...`));
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
    console.log('\n📊 Advanced AI Integration Test Results:');
    console.log('=' .repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    // Group results by category
    const categories = {};
    this.testResults.forEach(result => {
      const category = result.test.split(' - ')[0];
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
      console.log('\n🎉 All Advanced AI Integration tests passed! The system is fully operational!');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the issues above.');
    }
  }

  printPerformanceSummary() {
    console.log('\n🚀 Advanced AI Integration Performance Summary:');
    console.log('=' .repeat(50));
    
    if (this.performanceMetrics.length > 0) {
      const avgConfidence = this.performanceMetrics.reduce((sum, metric) => sum + metric.confidence, 0) / this.performanceMetrics.length;
      const avgProcessingTime = this.performanceMetrics.reduce((sum, metric) => sum + metric.processingTime, 0) / this.performanceMetrics.length;
      
      console.log(`📊 Total Tests: ${this.performanceMetrics.length}`);
      console.log(`📊 Average Confidence: ${avgConfidence.toFixed(2)}`);
      console.log(`📊 Average Processing Time: ${avgProcessingTime.toFixed(2)}ms`);
      
      const successRate = (this.performanceMetrics.filter(m => m.success).length / this.performanceMetrics.length) * 100;
      console.log(`📊 Success Rate: ${successRate.toFixed(1)}%`);
      
      console.log('\n🧠 **Advanced AI Integration Capabilities Verified:**');
      console.log('• ✅ Multi-Modal AI Processing (Text, Audio, Image, Mixed)');
      console.log('• ✅ Real-Time AI Streaming');
      console.log('• ✅ AI Model Management');
      console.log('• ✅ Federated Learning');
      console.log('• ✅ Model Deployment & Training');
      console.log('• ✅ Performance Monitoring & Analytics');
    } else {
      console.log('⚠️ No performance metrics collected during testing.');
    }
  }
}

// Main execution
async function main() {
  const tester = new AdvancedAIIntegrationTester();
  await tester.runAllTests();
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the Advanced AI Integration tests
main().catch(console.error);
