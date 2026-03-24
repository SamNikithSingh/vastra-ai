const fs = require('fs');

async function testHuggingFace() {
  const endpoint = 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';
  
  // Use a dummy token if we don't have one, just to see the error message type
  const apiKey = 'hf_dummy_token_12345';
  
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${apiKey}`);
  headers.append('Content-Type', 'application/json');
  
  const body = JSON.stringify({
    inputs: 'Test prompt',
    options: { wait_for_model: true }
  });
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: body
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    console.log(`Response Body: ${text}`);
    
    console.log(`CORS Headers (Access-Control-Allow-Origin):`, response.headers.get('access-control-allow-origin') || 'Not present');
    
  } catch (err) {
    console.error(`Fetch Error:`, err);
  }
}

testHuggingFace();
