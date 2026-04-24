const request = require('supertest');
const app = require('../index');

describe('Backend Smoke Tests', () => {
  test('GET / should return operational status', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('operational');
  });

  test('GET /api/stats should be reachable', async () => {
    const res = await request(app).get('/api/stats');
    // It might return 200 or 401 depending on auth, but we check if it doesn't 404
    expect(res.statusCode).not.toEqual(404);
  });
});
