// Test script to verify service account authentication
const { authenticatedFetch } = require('./lib/auth/google-auth');

async function testAuthentication() {
  console.log('🧪 Testing Service Account Authentication...\n');

  try {
    // Test health check endpoint
    console.log('🔍 Testing health check endpoint...');
    const healthResponse = await authenticatedFetch('https://us-central1-acs-dev-464702.cloudfunctions.net/auth-health-check-dev');
    
    console.log('📥 Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check successful:', healthData);
    } else {
      console.log('❌ Health check failed');
    }

    console.log('\n🔍 Testing login endpoint...');
    const loginResponse = await authenticatedFetch('https://us-central1-acs-dev-464702.cloudfunctions.net/login-dev', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });

    console.log('📥 Login status:', loginResponse.status);
    
    if (loginResponse.status === 401) {
      console.log('✅ Login endpoint accessible (expected 401 for invalid credentials)');
    } else if (loginResponse.ok) {
      console.log('✅ Login endpoint working');
    } else {
      console.log('❌ Login endpoint error:', loginResponse.status);
    }

    console.log('\n🎯 Authentication test completed!');
    
  } catch (error) {
    console.error('💥 Authentication test failed:', error.message);
  }
}

// Run the test
testAuthentication().catch(console.error); 