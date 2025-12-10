import logger from '../../../../src/utils/logger';
import { AuditService } from '../../../../src/services/logging/audit.service';

jest.mock('../../../../src/utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
}));

describe('AuditService', () => {
  it('logSecurityEvent should route by severity', () => {
    AuditService.logSecurityEvent({ action: 'A', resource: 'R', result: 'SUCCESS', severity: 'info' });
    AuditService.logSecurityEvent({ action: 'A', resource: 'R', result: 'FAILURE', severity: 'warn' });
    AuditService.logSecurityEvent({ action: 'A', resource: 'R', result: 'FAILURE', severity: 'error' });
    expect((logger as any).info).toHaveBeenCalled();
    expect((logger as any).warn).toHaveBeenCalled();
    expect((logger as any).error).toHaveBeenCalled();
  });

  it('logBusinessEvent should log info', () => {
    AuditService.logBusinessEvent({ action: 'BIZ', resource: 'X', result: 'SUCCESS' });
    expect((logger as any).info).toHaveBeenCalled();
  });

  it('logSystemEvent should use logger.log', () => {
    AuditService.logSystemEvent('BOOT', { ok: true }, 'warn');
    expect((logger as any).log).toHaveBeenCalledWith('warn', expect.any(String), expect.any(Object));
  });
});

