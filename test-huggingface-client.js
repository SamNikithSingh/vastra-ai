// Test HuggingFaceClient class implementation

class HuggingFaceClient {
  constructor(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key: must be a non-empty string');
    }
    this.apiKey = apiKey;
    this.endpoint = 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';
  }
  
  buildHeaders() {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${this.apiKey}`);
    headers.append('Content-Type', 'application/json');
    return headers;
  }
  
  async handleError(response) {
    const status = response.status;
    
    if (status === 401) {
      return new Error('INVALID_TOKEN');
    }
    
    if (status === 429) {
      return new Error('RATE_LIMIT');
    }
    
    if (status === 503) {
      return new Error('MODEL_LOADING');
    }
    
    return new Error(`API_ERROR: ${status}`);
  }
}

// Run tests
console.log('Testing HuggingFaceClient...\n');

let passCount = 0;
let failCount = 0;

// Test 1: Constructor with valid API key
try {
  const client = new HuggingFaceClient('hf_test123');
  const apiKeyCorrect = client.apiKey === 'hf_test123';
  const endpointCorrect = client.endpoint === 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';
  
  if (apiKeyCorrect && endpointCorrect) {
    console.log('✓ Test 1 PASS: Constructor accepts valid API key');
    console.log('  - API key stored correctly');
    console.log('  - Endpoint set correctly');
    passCount++;
  } else {
    console.log('✗ Test 1 FAIL: Constructor properties incorrect');
    failCount++;
  }
} catch (e) {
  console.log('✗ Test 1 FAIL:', e.message);
  failCount++;
}

// Test 2: Constructor rejects empty string
try {
  new HuggingFaceClient('');
  console.log('✗ Test 2 FAIL: Should reject empty string');
  failCount++;
} catch (e) {
  console.log('✓ Test 2 PASS: Constructor rejects empty string');
  passCount++;
}

// Test 3: Constructor rejects null
try {
  new HuggingFaceClient(null);
  console.log('✗ Test 3 FAIL: Should reject null');
  failCount++;
} catch (e) {
  console.log('✓ Test 3 PASS: Constructor rejects null');
  passCount++;
}

// Test 4: Constructor rejects non-string
try {
  new HuggingFaceClient(123);
  console.log('✗ Test 4 FAIL: Should reject non-string');
  failCount++;
} catch (e) {
  console.log('✓ Test 4 PASS: Constructor rejects non-string');
  passCount++;
}

// Test 5: buildHeaders creates correct headers
try {
  const client = new HuggingFaceClient('hf_test123');
  const headers = client.buildHeaders();
  const authHeader = headers.get('Authorization');
  const contentType = headers.get('Content-Type');
  
  if (authHeader === 'Bearer hf_test123' && contentType === 'application/json') {
    console.log('✓ Test 5 PASS: buildHeaders creates correct headers');
    console.log('  - Authorization: Bearer hf_test123');
    console.log('  - Content-Type: application/json');
    passCount++;
  } else {
    console.log('✗ Test 5 FAIL: Headers incorrect');
    console.log('  - Authorization:', authHeader);
    console.log('  - Content-Type:', contentType);
    failCount++;
  }
} catch (e) {
  console.log('✗ Test 5 FAIL:', e.message);
  failCount++;
}

// Test 6: handleError maps 401 to INVALID_TOKEN
(async () => {
  try {
    const client = new HuggingFaceClient('hf_test123');
    const mockResponse = { status: 401 };
    const error = await client.handleError(mockResponse);
    
    if (error.message === 'INVALID_TOKEN') {
      console.log('✓ Test 6 PASS: 401 error mapped to INVALID_TOKEN');
      passCount++;
    } else {
      console.log('✗ Test 6 FAIL: Expected INVALID_TOKEN, got', error.message);
      failCount++;
    }
  } catch (e) {
    console.log('✗ Test 6 FAIL:', e.message);
    failCount++;
  }
  
  // Test 7: handleError maps 429 to RATE_LIMIT
  try {
    const client = new HuggingFaceClient('hf_test123');
    const mockResponse = { status: 429 };
    const error = await client.handleError(mockResponse);
    
    if (error.message === 'RATE_LIMIT') {
      console.log('✓ Test 7 PASS: 429 error mapped to RATE_LIMIT');
      passCount++;
    } else {
      console.log('✗ Test 7 FAIL: Expected RATE_LIMIT, got', error.message);
      failCount++;
    }
  } catch (e) {
    console.log('✗ Test 7 FAIL:', e.message);
    failCount++;
  }
  
  // Test 8: handleError maps 503 to MODEL_LOADING
  try {
    const client = new HuggingFaceClient('hf_test123');
    const mockResponse = { status: 503 };
    const error = await client.handleError(mockResponse);
    
    if (error.message === 'MODEL_LOADING') {
      console.log('✓ Test 8 PASS: 503 error mapped to MODEL_LOADING');
      passCount++;
    } else {
      console.log('✗ Test 8 FAIL: Expected MODEL_LOADING, got', error.message);
      failCount++;
    }
  } catch (e) {
    console.log('✗ Test 8 FAIL:', e.message);
    failCount++;
  }
  
  // Test 9: Endpoint is correct
  try {
    const client = new HuggingFaceClient('hf_test123');
    const expectedEndpoint = 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';
    
    if (client.endpoint === expectedEndpoint) {
      console.log('✓ Test 9 PASS: Endpoint URL is correct');
      passCount++;
    } else {
      console.log('✗ Test 9 FAIL: Endpoint incorrect');
      console.log('  Expected:', expectedEndpoint);
      console.log('  Got:', client.endpoint);
      failCount++;
    }
  } catch (e) {
    console.log('✗ Test 9 FAIL:', e.message);
    failCount++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Test Summary:');
  console.log(`  Passed: ${passCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Total: ${passCount + failCount}`);
  console.log('='.repeat(50));
  
  if (failCount === 0) {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n✗ Some tests failed!');
    process.exit(1);
  }
})();
