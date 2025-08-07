const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing MUDA Pay Health Monitor API...\n');

  try {
    // Test 1: API Health Check
    console.log('1. Testing API health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ API Health:', healthResponse.data);
    console.log('');

    // Test 2: Get monitoring status
    console.log('2. Testing monitoring status...');
    const monitoringResponse = await axios.get(`${BASE_URL}/api/health/monitoring`);
    console.log('✅ Monitoring Status:', monitoringResponse.data);
    console.log('');

    // Test 3: Get health status
    console.log('3. Testing health status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/health/status`);
    console.log('✅ Health Status:', JSON.stringify(statusResponse.data, null, 2));
    console.log('');

    // Test 4: Get uptime statistics
    console.log('4. Testing uptime statistics...');
    const uptimeResponse = await axios.get(`${BASE_URL}/api/health/uptime?hours=24`);
    console.log('✅ Uptime Stats:', JSON.stringify(uptimeResponse.data, null, 2));
    console.log('');

    // Test 5: Get health history
    console.log('5. Testing health history...');
    const historyResponse = await axios.get(`${BASE_URL}/api/health/history?limit=5`);
    console.log('✅ Health History:', JSON.stringify(historyResponse.data, null, 2));
    console.log('');

    console.log('🎉 All tests passed! The API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAPI(); 