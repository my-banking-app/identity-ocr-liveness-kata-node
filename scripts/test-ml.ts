import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const API_URL = 'http://localhost:3000/api';

async function testML() {
  try {
    // 1. Register/Login
    console.log('Authenticating...');
    const email = `test-ml-${Date.now()}@example.com`;
    await axios.post(`${API_URL}/auth/register`, {
      email,
      password: 'Password123!',
      name: 'ML Tester'
    });
    
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email,
      password: 'Password123!'
    });
    
    const token = loginRes.data.accessToken;
    console.log('Authenticated. Token obtained.');

    // 2. Test Deepfake Detection
    console.log('Testing Deepfake Detection...');
    const form = new FormData();
    // Use test-id.png which is known to be a valid image
    const imagePath = path.join(__dirname, '../test-data/test-id.png');
    
    if (!fs.existsSync(imagePath)) {
        console.error('Test image not found at', imagePath);
        return;
    }

    form.append('image', fs.createReadStream(imagePath));

    const mlRes = await axios.post(`${API_URL}/ml/detect-deepfake`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Deepfake Detection Result:', JSON.stringify(mlRes.data, null, 2));

  } catch (error: any) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testML();
