import logger from '../../utils/logger';
import { Request } from 'express';

export interface AuditEvent {
  action: string;
  resource: string;
  userId?: string;
  details?: any;
  result: 'SUCCESS' | 'FAILURE';
  severity?: 'info' | 'warn' | 'error' | 'critical';
  sensitive?: boolean; // If true, details will be encrypted
}

export class AuditService {
  
  static logSecurityEvent(event: AuditEvent, req?: Request) {
    const logData = {
      category: 'SECURITY',
      action: event.action,
      resource: event.resource,
      userId: event.userId || (req as any)?.user?.id || 'anonymous',
      ip: req?.ip,
      userAgent: req?.headers['user-agent'],
      result: event.result,
      details: event.details,
      sensitive: event.sensitive || false
    };

    if (event.severity === 'critical' || event.severity === 'error') {
      logger.error(`SECURITY ALERT: ${event.action}`, logData);
    } else if (event.severity === 'warn') {
      logger.warn(`SECURITY WARN: ${event.action}`, logData);
    } else {
      logger.info(`SECURITY EVENT: ${event.action}`, logData);
    }
  }

  static logBusinessEvent(event: AuditEvent) {
    const logData = {
      category: 'BUSINESS',
      action: event.action,
      resource: event.resource,
      userId: event.userId || 'system',
      result: event.result,
      details: event.details,
      sensitive: event.sensitive || false
    };

    logger.info(`BUSINESS EVENT: ${event.action}`, logData);
  }

  static logSystemEvent(action: string, details: any, level: 'info' | 'warn' | 'error' = 'info') {
      const logData = {
          category: 'SYSTEM',
          action,
          details
      };
      logger.log(level, `SYSTEM EVENT: ${action}`, logData);
  }
}
