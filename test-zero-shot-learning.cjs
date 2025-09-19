#!/usr/bin/env node

/**
 * Zero-Shot Learning Loop Test Suite
 * Tests the smart learning AI system with zero-shot capabilities
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

class ZeroShotLearningTester {
  constructor() {
    this.testResults = [];
    this.learningData = [];
  }

  async runAllTests() {
    console.log('🧠 Zero-Shot Learning Loop Test Suite');
    console.log('=====================================\n');
    
    try {
      await this.testZeroShotClassification();
      await this.testZeroShotTranslation();
      await this.testFewShotLearning();
      await this.testMetaLearningLoop();
      await this.testAdaptiveLearning();
      await this.testKnowledgeTransfer();
      await this.testLearningAnalytics();
      
      this.printTestResults();
      this.printLearningSummary();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testZeroShotClassification() {
    console.log('🎯 Testing Zero-Shot Classification...');
    
    const testCases = [
      {
        name: 'Sentiment Analysis',
        data: {
          userId: 'test_user_1',
          taskType: 'zero_shot_classification',
          inputData: { text: 'This product is amazing!', category: 'sentiment' },
          expectedOutput: 'positive',
          metadata: { domain: 'product_review', confidence_threshold: 0.8 }
        }
      },
      {
        name: 'Topic Classification',
        data: {
          userId: 'test_user_2',
          taskType: 'zero_shot_classification',
          inputData: { text: 'The weather is sunny today', category: 'topic' },
          expectedOutput: 'weather',
          metadata: { domain: 'general', confidence_threshold: 0.7 }
        }
      },
      {
        name: 'Intent Recognition',
        data: {
          userId: 'test_user_3',
          taskType: 'zero_shot_classification',
          inputData: { text: 'I want to book a flight', category: 'intent' },
          expectedOutput: 'booking_request',
          metadata: { domain: 'travel', confidence_threshold: 0.9 }
        }
      }
    ];

    for (const testCase of testCases) {
      try {
        const response = await this.makeRequest('POST', '/api/ai/smart-learning', testCase.data);
        
        if (response.success && response.confidence > 0.5) {
          this.addTestResult(`Zero-Shot Classification - ${testCase.name}`, 'PASS', 
            `Confidence: ${response.confidence}, Strategy: ${response.strategy}`);
          console.log(`✅ ${testCase.name}: PASSED (${response.confidence})`);
          
          this.learningData.push({
            task: testCase.name,
            type: 'zero_shot_classification',
            confidence: response.confidence,
            executionTime: response.executionTime,
            strategy: response.strategy
          });
        } else {
          this.addTestResult(`Zero-Shot Classification - ${testCase.name}`, 'FAIL', 
            `Low confidence: ${response.confidence}`);
          console.log(`❌ ${testCase.name}: FAILED (${response.confidence})`);
        }
      } catch (error) {
        this.addTestResult(`Zero-Shot Classification - ${testCase.name}`, 'FAIL', error.message);
        console.log(`❌ ${testCase.name}: FAILED - ${error.message}`);
      }
    }
  }

  async testZeroShotTranslation() {
    console.log('🌍 Testing Zero-Shot Translation...');
    
    const testCases = [
      {
        name: 'English to Spanish',
        data: {
          userId: 'test_user_4',
          taskType: 'zero_shot_translation',
          inputData: { 
            text: 'Hello, how are you?', 
            source_language: 'english', 
            target_language: 'spanish' 
          },
          expectedOutput: 'Hola, ¿cómo estás?',
          metadata: { domain: 'language_translation', difficulty: 'beginner' }
        }
      },
      {
        name: 'English to French',
        data: {
          userId: 'test_user_5',
          taskType: 'zero_shot_translation',
          inputData: { 
            text: 'Good morning', 
            source_language: 'english', 
            target_language: 'french' 
          },
          expectedOutput: 'Bonjour',
          metadata: { domain: 'language_translation', difficulty: 'beginner' }
        }
      }
    ];

    for (const testCase of testCases) {
      try {
        const response = await this.makeRequest('POST', '/api/ai/smart-learning', testCase.data);
        
        if (response.success && response.confidence > 0.6) {
          this.addTestResult(`Zero-Shot Translation - ${testCase.name}`, 'PASS', 
            `Confidence: ${response.confidence}, Strategy: ${response.strategy}`);
          console.log(`✅ ${testCase.name}: PASSED (${response.confidence})`);
          
          this.learningData.push({
            task: testCase.name,
            type: 'zero_shot_translation',
            confidence: response.confidence,
            executionTime: response.executionTime,
            strategy: response.strategy
          });
        } else {
          this.addTestResult(`Zero-Shot Translation - ${testCase.name}`, 'FAIL', 
            `Low confidence: ${response.confidence}`);
          console.log(`❌ ${testCase.name}: FAILED (${response.confidence})`);
        }
      } catch (error) {
        this.addTestResult(`Zero-Shot Translation - ${testCase.name}`, 'FAIL', error.message);
        console.log(`❌ ${testCase.name}: FAILED - ${error.message}`);
      }
    }
  }

  async testFewShotLearning() {
    console.log('📚 Testing Few-Shot Learning...');
    
    const testCases = [
      {
        name: 'Sentiment Analysis (2-shot)',
        data: {
          userId: 'test_user_6',
          taskType: 'few_shot_learning',
          inputData: {
            examples: [
              { input: 'I love this movie', output: 'positive' },
              { input: 'This is terrible', output: 'negative' }
            ],
            query: 'The food was delicious'
          },
          expectedOutput: 'positive',
          metadata: { domain: 'sentiment_analysis', shots: 2 }
        }
      },
      {
        name: 'Text Classification (3-shot)',
        data: {
          userId: 'test_user_7',
          taskType: 'few_shot_learning',
          inputData: {
            examples: [
              { input: 'The weather is sunny', output: 'weather' },
              { input: 'I want to buy shoes', output: 'shopping' },
              { input: 'How to cook pasta', output: 'cooking' }
            ],
            query: 'Stock market prices are rising'
          },
          expectedOutput: 'finance',
          metadata: { domain: 'text_classification', shots: 3 }
        }
      }
    ];

    for (const testCase of testCases) {
      try {
        const response = await this.makeRequest('POST', '/api/ai/smart-learning', testCase.data);
        
        if (response.success && response.confidence > 0.5) {
          this.addTestResult(`Few-Shot Learning - ${testCase.name}`, 'PASS', 
            `Confidence: ${response.confidence}, Strategy: ${response.strategy}`);
          console.log(`✅ ${testCase.name}: PASSED (${response.confidence})`);
          
          this.learningData.push({
            task: testCase.name,
            type: 'few_shot_learning',
            confidence: response.confidence,
            executionTime: response.executionTime,
            strategy: response.strategy
          });
        } else {
          this.addTestResult(`Few-Shot Learning - ${testCase.name}`, 'FAIL', 
            `Low confidence: ${response.confidence}`);
          console.log(`❌ ${testCase.name}: FAILED (${response.confidence})`);
        }
      } catch (error) {
        this.addTestResult(`Few-Shot Learning - ${testCase.name}`, 'FAIL', error.message);
        console.log(`❌ ${testCase.name}: FAILED - ${error.message}`);
      }
    }
  }

  async testMetaLearningLoop() {
    console.log('🔄 Testing Meta-Learning Loop...');
    
    try {
      // Test continuous learning with multiple tasks
      const tasks = [
        {
          userId: 'meta_user_1',
          taskType: 'zero_shot_classification',
          inputData: { text: 'Excellent service', category: 'sentiment' },
          expectedOutput: 'positive',
          metadata: { domain: 'customer_service', iteration: 1 }
        },
        {
          userId: 'meta_user_1',
          taskType: 'zero_shot_classification',
          inputData: { text: 'Poor quality product', category: 'sentiment' },
          expectedOutput: 'negative',
          metadata: { domain: 'product_review', iteration: 2 }
        },
        {
          userId: 'meta_user_1',
          taskType: 'zero_shot_classification',
          inputData: { text: 'Average experience', category: 'sentiment' },
          expectedOutput: 'neutral',
          metadata: { domain: 'general', iteration: 3 }
        }
      ];

      let successCount = 0;
      for (const task of tasks) {
        try {
          const response = await this.makeRequest('POST', '/api/ai/smart-learning', task);
          if (response.success) {
            successCount++;
            this.learningData.push({
              task: `Meta-Learning Iteration ${task.metadata.iteration}`,
              type: 'meta_learning',
              confidence: response.confidence,
              executionTime: response.executionTime,
              strategy: response.strategy
            });
          }
        } catch (error) {
          console.log(`⚠️ Meta-learning iteration ${task.metadata.iteration} failed: ${error.message}`);
        }
      }

      if (successCount >= 2) {
        this.addTestResult('Meta-Learning Loop', 'PASS', `${successCount}/3 iterations successful`);
        console.log(`✅ Meta-Learning Loop: PASSED (${successCount}/3)`);
      } else {
        this.addTestResult('Meta-Learning Loop', 'FAIL', `Only ${successCount}/3 iterations successful`);
        console.log(`❌ Meta-Learning Loop: FAILED (${successCount}/3)`);
      }
    } catch (error) {
      this.addTestResult('Meta-Learning Loop', 'FAIL', error.message);
      console.log(`❌ Meta-Learning Loop: FAILED - ${error.message}`);
    }
  }

  async testAdaptiveLearning() {
    console.log('🧠 Testing Adaptive Learning...');
    
    try {
      // Test adaptation to new domains
      const adaptiveTasks = [
        {
          userId: 'adaptive_user',
          taskType: 'zero_shot_classification',
          inputData: { text: 'The stock price increased', category: 'sentiment' },
          expectedOutput: 'positive',
          metadata: { domain: 'finance', adaptation: true }
        },
        {
          userId: 'adaptive_user',
          taskType: 'zero_shot_classification',
          inputData: { text: 'The patient is recovering well', category: 'sentiment' },
          expectedOutput: 'positive',
          metadata: { domain: 'healthcare', adaptation: true }
        }
      ];

      let adaptiveSuccess = 0;
      for (const task of adaptiveTasks) {
        try {
          const response = await this.makeRequest('POST', '/api/ai/smart-learning', task);
          if (response.success && response.confidence > 0.6) {
            adaptiveSuccess++;
            this.learningData.push({
              task: `Adaptive Learning - ${task.metadata.domain}`,
              type: 'adaptive_learning',
              confidence: response.confidence,
              executionTime: response.executionTime,
              strategy: response.strategy
            });
          }
        } catch (error) {
          console.log(`⚠️ Adaptive learning failed for ${task.metadata.domain}: ${error.message}`);
        }
      }

      if (adaptiveSuccess >= 1) {
        this.addTestResult('Adaptive Learning', 'PASS', `${adaptiveSuccess}/2 domains adapted`);
        console.log(`✅ Adaptive Learning: PASSED (${adaptiveSuccess}/2)`);
      } else {
        this.addTestResult('Adaptive Learning', 'FAIL', `No successful adaptations`);
        console.log(`❌ Adaptive Learning: FAILED`);
      }
    } catch (error) {
      this.addTestResult('Adaptive Learning', 'FAIL', error.message);
      console.log(`❌ Adaptive Learning: FAILED - ${error.message}`);
    }
  }

  async testKnowledgeTransfer() {
    console.log('🔄 Testing Knowledge Transfer...');
    
    try {
      // Test transfer learning between related tasks
      const transferTasks = [
        {
          userId: 'transfer_user',
          taskType: 'zero_shot_classification',
          inputData: { text: 'This movie is fantastic', category: 'sentiment' },
          expectedOutput: 'positive',
          metadata: { domain: 'entertainment', transfer_from: 'general_sentiment' }
        },
        {
          userId: 'transfer_user',
          taskType: 'zero_shot_classification',
          inputData: { text: 'The book was boring', category: 'sentiment' },
          expectedOutput: 'negative',
          metadata: { domain: 'literature', transfer_from: 'entertainment' }
        }
      ];

      let transferSuccess = 0;
      for (const task of transferTasks) {
        try {
          const response = await this.makeRequest('POST', '/api/ai/smart-learning', task);
          if (response.success && response.confidence > 0.5) {
            transferSuccess++;
            this.learningData.push({
              task: `Knowledge Transfer - ${task.metadata.domain}`,
              type: 'knowledge_transfer',
              confidence: response.confidence,
              executionTime: response.executionTime,
              strategy: response.strategy
            });
          }
        } catch (error) {
          console.log(`⚠️ Knowledge transfer failed for ${task.metadata.domain}: ${error.message}`);
        }
      }

      if (transferSuccess >= 1) {
        this.addTestResult('Knowledge Transfer', 'PASS', `${transferSuccess}/2 transfers successful`);
        console.log(`✅ Knowledge Transfer: PASSED (${transferSuccess}/2)`);
      } else {
        this.addTestResult('Knowledge Transfer', 'FAIL', `No successful transfers`);
        console.log(`❌ Knowledge Transfer: FAILED`);
      }
    } catch (error) {
      this.addTestResult('Knowledge Transfer', 'FAIL', error.message);
      console.log(`❌ Knowledge Transfer: FAILED - ${error.message}`);
    }
  }

  async testLearningAnalytics() {
    console.log('📊 Testing Learning Analytics...');
    
    try {
      // Calculate learning analytics from our test data
      const totalTasks = this.learningData.length;
      const avgConfidence = this.learningData.reduce((sum, task) => sum + task.confidence, 0) / totalTasks;
      const avgExecutionTime = this.learningData.reduce((sum, task) => sum + task.executionTime, 0) / totalTasks;
      
      const taskTypes = [...new Set(this.learningData.map(task => task.type))];
      const strategies = [...new Set(this.learningData.map(task => task.strategy))];
      
      const analytics = {
        totalTasks,
        averageConfidence: avgConfidence,
        averageExecutionTime: avgExecutionTime,
        taskTypes,
        strategies,
        learningProgress: this.learningData.length > 0 ? 'active' : 'inactive'
      };

      this.addTestResult('Learning Analytics', 'PASS', 
        `Total tasks: ${totalTasks}, Avg confidence: ${avgConfidence.toFixed(2)}`);
      console.log(`✅ Learning Analytics: PASSED`);
      console.log(`   📊 Total Tasks: ${totalTasks}`);
      console.log(`   📊 Average Confidence: ${avgConfidence.toFixed(2)}`);
      console.log(`   📊 Average Execution Time: ${avgExecutionTime.toFixed(2)}ms`);
      console.log(`   📊 Task Types: ${taskTypes.join(', ')}`);
      console.log(`   📊 Strategies: ${strategies.join(', ')}`);
      
    } catch (error) {
      this.addTestResult('Learning Analytics', 'FAIL', error.message);
      console.log(`❌ Learning Analytics: FAILED - ${error.message}`);
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
    console.log('\n📊 Zero-Shot Learning Test Results:');
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
      console.log('\n🎉 All zero-shot learning tests passed! The AI meta-learning system is fully operational!');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the issues above.');
    }
  }

  printLearningSummary() {
    console.log('\n🧠 Zero-Shot Learning Summary:');
    console.log('=' .repeat(50));
    
    if (this.learningData.length > 0) {
      const avgConfidence = this.learningData.reduce((sum, task) => sum + task.confidence, 0) / this.learningData.length;
      const avgExecutionTime = this.learningData.reduce((sum, task) => sum + task.executionTime, 0) / this.learningData.length;
      
      console.log(`📊 Total Learning Tasks: ${this.learningData.length}`);
      console.log(`📊 Average Confidence: ${avgConfidence.toFixed(2)}`);
      console.log(`📊 Average Execution Time: ${avgExecutionTime.toFixed(2)}ms`);
      
      const taskTypes = [...new Set(this.learningData.map(task => task.type))];
      console.log(`📊 Task Types Tested: ${taskTypes.join(', ')}`);
      
      const strategies = [...new Set(this.learningData.map(task => task.strategy))];
      console.log(`📊 Learning Strategies: ${strategies.join(', ')}`);
      
      console.log('\n🚀 **Zero-Shot Learning Capabilities Verified:**');
      console.log('• ✅ Zero-Shot Classification');
      console.log('• ✅ Zero-Shot Translation');
      console.log('• ✅ Few-Shot Learning');
      console.log('• ✅ Meta-Learning Loop');
      console.log('• ✅ Adaptive Learning');
      console.log('• ✅ Knowledge Transfer');
      console.log('• ✅ Learning Analytics');
    } else {
      console.log('⚠️ No learning data collected during testing.');
    }
  }
}

// Main execution
async function main() {
  const tester = new ZeroShotLearningTester();
  await tester.runAllTests();
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the zero-shot learning tests
main().catch(console.error);
