const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testDashboardAPIs() {
  console.log('🧪 Testing MUDA Pay Dashboard APIs...\n');

  const tests = [
    // 1. System Health Overview APIs
    {
      name: 'System Heartbeat',
      url: '/api/system/heartbeat',
      description: 'Get 24-hour system heartbeat data'
    },
    {
      name: 'System Health',
      url: '/api/system/health',
      description: 'Get overall system health status'
    },

    // 2. Microservices Health APIs
    {
      name: 'Microservices Status',
      url: '/api/system/microservices',
      description: 'Get current microservices status'
    },
    {
      name: 'Microservices Uptime',
      url: '/api/system/microservices/uptime?hours=24',
      description: 'Get microservices uptime statistics'
    },

    // 3. System Events APIs
    {
      name: 'System Events',
      url: '/api/system/events?limit=10',
      description: 'Get recent system events'
    },

    // 4. Request Logs APIs
    {
      name: 'Request Stats',
      url: '/api/system/requests/stats',
      description: 'Get daily request statistics'
    },
    {
      name: 'Status Code Distribution',
      url: '/api/system/requests/status-codes',
      description: 'Get HTTP status code distribution'
    },

    // 5. Performance Metrics APIs
    {
      name: 'Performance Metrics',
      url: '/api/system/performance',
      description: 'Get current performance metrics'
    },
    {
      name: 'Performance Trends',
      url: '/api/system/performance/trends?hours=24',
      description: 'Get performance trends over time'
    },

    // 6. Error Analysis APIs
    {
      name: 'Error Summary',
      url: '/api/system/errors/summary?hours=24',
      description: 'Get error summary statistics'
    },
    {
      name: 'Error Details',
      url: '/api/system/errors/details?limit=10',
      description: 'Get detailed error information'
    },

    // 7. Live System Status API
    {
      name: 'Live System Status',
      url: '/api/system/live',
      description: 'Get real-time system status'
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`📊 Testing: ${test.name}`);
      console.log(`   Description: ${test.description}`);
      console.log(`   URL: ${test.url}`);

      const response = await axios.get(`${BASE_URL}${test.url}`);
      
      if (response.status === 200 && response.data.success) {
        console.log(`   ✅ PASSED - Status: ${response.status}`);
        console.log(`   📦 Data: ${JSON.stringify(response.data.data).substring(0, 100)}...`);
        passedTests++;
      } else {
        console.log(`   ❌ FAILED - Status: ${response.status}`);
        console.log(`   📦 Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ FAILED - Error: ${error.message}`);
      if (error.response) {
        console.log(`   📦 Response: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('');
  }

  console.log('📋 Test Summary:');
  console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`   📊 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All dashboard APIs are working correctly!');
  } else {
    console.log('\n⚠️ Some APIs failed. Check the logs above for details.');
  }
}

// Test specific API endpoints with detailed output
async function testSpecificAPIs() {
  console.log('\n🔍 Detailed API Testing...\n');

  const detailedTests = [
    {
      name: 'System Heartbeat (24 hours)',
      url: '/api/system/heartbeat?hours=24',
      expectedFields: ['hour', 'status', 'requests']
    },
    {
      name: 'System Health Overview',
      url: '/api/system/health',
      expectedFields: ['status', 'uptime', 'total_services', 'healthy_services']
    },
    {
      name: 'Microservices Status',
      url: '/api/system/microservices',
      expectedFields: ['name', 'status', 'uptime', 'response_time']
    },
    {
      name: 'Performance Metrics',
      url: '/api/system/performance',
      expectedFields: ['cpu_usage', 'memory_usage', 'active_connections', 'queue_depth']
    }
  ];

  for (const test of detailedTests) {
    try {
      console.log(`🔬 Testing: ${test.name}`);
      const response = await axios.get(`${BASE_URL}${test.url}`);
      
      if (response.status === 200 && response.data.success) {
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📊 Data Structure:`);
        
        if (Array.isArray(response.data.data)) {
          console.log(`   📦 Array with ${response.data.data.length} items`);
          if (response.data.data.length > 0) {
            const firstItem = response.data.data[0];
            console.log(`   📋 First item keys: ${Object.keys(firstItem).join(', ')}`);
          }
        } else {
          console.log(`   📦 Object with keys: ${Object.keys(response.data.data).join(', ')}`);
        }
        
        // Check if expected fields are present
        if (test.expectedFields) {
          const data = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
          const missingFields = test.expectedFields.filter(field => !(field in data));
          if (missingFields.length === 0) {
            console.log(`   ✅ All expected fields present`);
          } else {
            console.log(`   ⚠️ Missing fields: ${missingFields.join(', ')}`);
          }
        }
      } else {
        console.log(`   ❌ Failed - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

// Run tests
async function runTests() {
  try {
    await testDashboardAPIs();
    await testSpecificAPIs();
  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
  }
}

// Check if API is running
async function checkAPIAvailability() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ API is running and accessible');
    return true;
  } catch (error) {
    console.log('❌ API is not accessible. Make sure the server is running with: npm run dev');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 MUDA Pay Dashboard API Tester');
  console.log('================================\n');
  
  const isAvailable = await checkAPIAvailability();
  if (!isAvailable) {
    process.exit(1);
  }
  
  await runTests();
}

main(); 