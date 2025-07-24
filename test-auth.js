// Test script to verify authentication flow
// Run with: node test-auth.js

const fetch = require('node-fetch');

async function testAuth() {
  console.log('🔍 Testing authentication flow...');
  
  try {
    // Test login endpoint
    console.log('\n📤 Testing login endpoint...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123',
        provider: 'form'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📥 Login response:', {
      status: loginResponse.status,
      success: loginData.success,
      hasToken: !!loginData.data?.token,
      hasAccountId: !!loginData.data?.account_id,
      accountId: loginData.data?.account_id,
      message: loginData.data?.message
    });
    
    if (loginData.data?.account_id) {
      console.log('✅ Account ID is properly set:', loginData.data.account_id);
    } else {
      console.log('❌ Account ID is missing from response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuth(); 