import client from 'prom-client';

// Create a Registry
const register = new client.Registry();

// Default metrics (CPU, Memory, Event Loop)
client.collectDefaultMetrics({ register });

// Custom Metrics

// 1. Authentication Success/Failure
export const authCounter = new client.Counter({
  name: 'auth_requests_total',
  help: 'Total number of authentication requests',
  labelNames: ['method', 'status'], // e.g. login/register, success/failure
});
register.registerMetric(authCounter);

// 2. Request Duration
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [50, 100, 200, 300, 400, 500, 1000, 2000, 5000],
});
register.registerMetric(httpRequestDurationMicroseconds);

// 3. Document Validation Stats
export const documentValidationCounter = new client.Counter({
  name: 'document_validation_total',
  help: 'Total document validations',
  labelNames: ['type', 'result'], // cedula/passport, valid/invalid/blacklisted
});
register.registerMetric(documentValidationCounter);

// 4. Liveness/Deepfake Stats
export const livenessCheckCounter = new client.Counter({
    name: 'liveness_check_total',
    help: 'Total liveness checks',
    labelNames: ['result', 'is_deepfake']
});
register.registerMetric(livenessCheckCounter);


export class MetricsService {
  static async getMetrics() {
    return register.metrics();
  }

  static getContentType() {
    return register.contentType;
  }
}
