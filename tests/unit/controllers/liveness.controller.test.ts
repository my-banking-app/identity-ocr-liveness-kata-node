import { LivenessController } from '../../../src/controllers/liveness.controller';

const mockReq = (body: any = {}, user: any = { userId: 'u1' }) => ({ body, user } as any);
const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

jest.mock('../../../src/services/liveness.service', () => ({
  LivenessService: {
    createSession: jest.fn(async () => ({ id: 's1', userId: 'u1', challenge: 'ZOOM_IN', status: 'PENDING', createdAt: new Date(), attempts: 0 })),
    processFrame: jest.fn(async () => ({ isLive: true, score: 0.8 })),
    getSession: jest.fn(async (id: string) => id === 's1' ? ({ id: 's1', userId: 'u1', challenge: 'ZOOM_IN', status: 'PASSED', createdAt: new Date(), attempts: 0 }) : null),
  }
}));

jest.mock('../../../src/services/logging/audit.service', () => ({
  AuditService: { logBusinessEvent: jest.fn() }
}));

describe('LivenessController', () => {
  it('startSession should create and return session', async () => {
    const req = mockReq();
    const res = mockRes();
    await LivenessController.startSession(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ sessionId: 's1' }));
  });

  it('validateFrame should require sessionId and file', async () => {
    const res1 = mockRes();
    await LivenessController.validateFrame(mockReq({}), res1);
    expect(res1.status).toHaveBeenCalledWith(400);

    const res2 = mockRes();
    await LivenessController.validateFrame({ body: { sessionId: 's1' } } as any, res2);
    expect(res2.status).toHaveBeenCalledWith(400);
  });

  it('validateFrame should process frame', async () => {
    const req = { body: { sessionId: 's1' }, file: { buffer: Buffer.from('img') }, user: { userId: 'u1' } } as any;
    const res = mockRes();
    await LivenessController.validateFrame(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Frame processed' }));
  });

  it('getSession should return 404 when missing', async () => {
    const res = mockRes();
    await LivenessController.getSession({ params: { id: 'missing' } } as any, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('finalizeSession should return 400 if no sessionId', async () => {
    const res = mockRes();
    await LivenessController.finalizeSession(mockReq({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

