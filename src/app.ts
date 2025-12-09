import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import session from 'express-session';
import { config } from './config/env';
import logger from './utils/logger';
import authRoutes from './routes/auth.routes';
import ocrRoutes from './routes/ocr.routes';
import livenessRoutes from './routes/liveness.routes';
import mlRoutes from './routes/ml.routes';
import validationRoutes from './routes/validation.routes';
import auditRoutes from './routes/audit.routes';
import { MetricsService, httpRequestDurationMicroseconds } from './services/logging/metrics.service';

const app = express();

// Traceability Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
  });
  next();
});

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", "'unsafe-inline'"],
        'script-src-attr': ["'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'blob:'],
      },
    },
  })
);
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing multipart/form-data support in some cases, though multer handles it.

// Session Configuration (Secure Cookies)
app.use(
  session({
    secret: config.security.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.nodeEnv === 'production', // Only secure in production (HTTPS)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Rate Limiting (apply only to API routes, not static assets/metrics)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/liveness', livenessRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/audit', auditRoutes);

// Logging
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }),
);

// Serve Static Files (Frontend Demo) after defining API and root route

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', MetricsService.getContentType());
  res.end(await MetricsService.getMetrics());
});

// Basic Route
app.get('/', (req, res) => {
  res.json({
    message: 'Identity OCR Liveness API is running',
    version: '1.0.0',
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

export default app;
 
// Mount static assets at the very end to avoid shadowing '/' JSON route
app.use(express.static(path.join(__dirname, '../public')));
