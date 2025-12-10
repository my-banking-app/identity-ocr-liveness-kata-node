import axios from 'axios';
import { AuditService } from '../src/services/logging/audit.service';

const API_URL = 'http://localhost:3000/api';

async function testTraceability() {
  try {
    console.log('--- STARTING TRACEABILITY TEST ---');

    // 1. Generate Auth Token (Login)
    console.log('1. Generating Auth Token...');
    const email = `audit-test-${Date.now()}@example.com`;
    await axios.post(`${API_URL}/auth/register`, {
      email,
      password: 'Password123!',
      name: 'Audit Tester'
    });
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email,
      password: 'Password123!'
    });
    const token = loginRes.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    // 2. Perform actions to generate logs and metrics
    console.log('2. Performing actions to generate logs...');
    
    // Valid Request
    await axios.post(`${API_URL}/validation/cedula`, { documentNumber: '12345678' }, { headers });
    
    // 3. Log Custom Security Event via Service (Simulated)
    console.log('3. Logging simulated security event...');
    AuditService.logSecurityEvent({
        action: 'MANUAL_TEST_EVENT',
        resource: 'TEST_SCRIPT',
        result: 'SUCCESS',
        sensitive: true,
        details: { secretData: 'This is a secret PII' }
    });

    // 4. Fetch Metrics
    console.log('4. Fetching Metrics...');
    const metricsRes = await axios.get('http://localhost:3000/metrics');
    console.log('Metrics retrieved (length):', metricsRes.data.length);
    if (metricsRes.data.includes('http_request_duration_ms')) {
        console.log('SUCCESS: Metrics contain http_request_duration_ms');
    }

    // 5. Fetch Audit Logs (Decrypted)
    console.log('5. Fetching Audit Logs (Decrypted)...');
    // Wait a bit for async file write
    await new Promise(r => setTimeout(r, 1000));
    
    const logsRes = await axios.get(`${API_URL}/audit/logs`, { headers });
    const logs = logsRes.data.logs;
    console.log(`Retrieved ${logs.length} log entries.`);
    
    // Check if encryption worked and was decrypted
    const foundSecret = logs.find((l: any) => 
        l.details && l.details.secretData === 'This is a secret PII'
    );

    if (foundSecret) {
        console.log('SUCCESS: Found decrypted secret in logs via API.');
    } else {
        console.log('WARNING: Did not find decrypted secret. Check if log file updated.');
    }

    console.log('--- TEST COMPLETED ---');

  } catch (error: any) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testTraceability();
