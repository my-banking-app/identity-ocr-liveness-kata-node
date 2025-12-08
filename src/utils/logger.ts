import winston from 'winston';
import 'winston-daily-rotate-file';
import { config } from '../config/env';
import { CryptoService } from '../services/crypto.service';

// Custom format to encrypt sensitive details
const encryptedFormat = winston.format((info) => {
  if (info.sensitive && typeof info.message === 'string') {
    info.message = `[ENCRYPTED] ${CryptoService.encrypt(info.message)}`;
  }
  if (info.details && typeof info.details === 'object') {
     // Encrypt details object as string
     const detailsStr = JSON.stringify(info.details);
     info.details = `[ENCRYPTED] ${CryptoService.encrypt(detailsStr)}`;
  }
  return info;
});

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    encryptedFormat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'identity-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/security-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'warn', // Store warn and error in security log
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

export default logger;
