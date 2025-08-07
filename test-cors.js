const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test the health endpoint
    const healthResponse = await fetch('http://localhost:3001/health');
    console.log('Health endpoint status:', healthResponse.status);
    
    // Test the microservices endpoint
    const microservicesResponse = await fetch('http://localhost:3001/api/system/microservices');
    console.log('Microservices endpoint status:', microservicesResponse.status);
    
    if (microservicesResponse.ok) {
      const data = await microservicesResponse.json();
      console.log('Microservices data:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI(); 