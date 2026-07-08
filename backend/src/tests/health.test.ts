import request from 'supertest';
import app from '../app';

describe('API Gateway Health check', () => {
  it('should return 200 OK for health routes', async () => {
    // Note: To execute this test during build pipeline, run 'npm i --save-dev supertest jest @types/jest'
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toEqual('healthy');
  });

  it('should redirect unknown routes to global error handlers', async () => {
    const res = await request(app).get('/api/v1/invalid-route-endpoint');
    expect(res.statusCode).toEqual(404);
  });
});
