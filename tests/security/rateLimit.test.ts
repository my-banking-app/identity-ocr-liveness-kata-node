import request from 'supertest';
import app from '../../src/app';

describe('Rate Limiting Security', () => {
  it('should enforce rate limits', async () => {
    // The limit is 100 per 15 min
    const limit = 100;
    const promises = [];

    // Make 100 requests (allowed)
    for (let i = 0; i < limit; i++) {
      promises.push(request(app).get('/health'));
    }

    const results = await Promise.all(promises);
    
    // Check that all 100 succeeded
    const failures = results.filter(r => r.status !== 200);
    if (failures.length > 0) {
      console.log('Failed requests:', failures.map(f => f.status));
    }
    expect(failures.length).toBe(0);

    // The 101st request should fail
    const blockedRes = await request(app).get('/health');
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.text).toContain('Too many requests');
  }, 30000); // Extended timeout
});
