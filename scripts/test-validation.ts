import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function testValidation() {
  try {
    // 1. Auth
    console.log('Authenticating...');
    const email = `test-val-${Date.now()}@example.com`;
    await axios.post(`${API_URL}/auth/register`, {
      email,
      password: 'Password123!',
      name: 'Validation Tester'
    });
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email,
      password: 'Password123!'
    });
    const token = loginRes.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    // 2. Test Valid Cedula (12345678)
    console.log('\nTesting Valid Cedula (12345678)...');
    const res1 = await axios.post(`${API_URL}/validation/cedula`, { documentNumber: '12345678' }, { headers });
    console.log('Result:', res1.data);

    // 3. Test Blacklisted (11111111)
    console.log('\nTesting Blacklisted (11111111)...');
    const res2 = await axios.post(`${API_URL}/validation/cedula`, { documentNumber: '11111111' }, { headers });
    console.log('Result:', res2.data);

    // 4. Test Mock External (Unknown ID ending in 9 -> NOT_FOUND in Mock)
    console.log('\nTesting Mock External (99999999)...');
    const res3 = await axios.post(`${API_URL}/validation/cedula`, { documentNumber: '99999999' }, { headers });
    console.log('Result:', res3.data);

    // 5. Test Mock External (Unknown ID ending in 0 -> VALID in Mock)
    console.log('\nTesting Mock External (10000000)...');
    const res4 = await axios.post(`${API_URL}/validation/cedula`, { documentNumber: '10000000' }, { headers });
    console.log('Result:', res4.data);

    // 6. Test Invalid Format
    console.log('\nTesting Invalid Format (ABC)...');
    const res5 = await axios.post(`${API_URL}/validation/cedula`, { documentNumber: 'ABC' }, { headers });
    console.log('Result:', res5.data);

    // 7. Test Cross Check
    console.log('\nTesting Cross Check (Valid Match)...');
    const res6 = await axios.post(`${API_URL}/validation/cross-check`, {
        documentNumber: '10000000',
        type: 'cedula',
        name: 'CIUDADANO EJEMPLAR',
        issueDate: '2010-05-20'
    }, { headers });
    console.log('Result:', res6.data);

    // 8. Test Status
    console.log('\nTesting Status (12345678)...');
    const res7 = await axios.get(`${API_URL}/validation/status/12345678`, { headers });
    console.log('Result:', res7.data);

  } catch (error: any) {
    console.error('Test failed step:', error.response?.data || error.message);
  }
}

testValidation();
