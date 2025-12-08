import { LivenessService } from '../../../src/services/liveness.service';
import * as faceapi from 'face-api.js';
import { loadImage } from 'canvas';

// Mock external dependencies
jest.mock('face-api.js', () => {
  return {
    env: {
      monkeyPatch: jest.fn(),
    },
    nets: {
      ssdMobilenetv1: { loadFromDisk: jest.fn() },
      faceLandmark68Net: { loadFromDisk: jest.fn() },
    },
    detectSingleFace: jest.fn(),
    Point: class Point {
      constructor(public x: number, public y: number) {}
    }
  };
});

jest.mock('canvas', () => ({
  loadImage: jest.fn(),
  Canvas: jest.fn(),
  Image: jest.fn(),
  ImageData: jest.fn(),
}));

jest.mock('../../../src/utils/logger');

describe('LivenessService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset private static properties if possible, or just rely on state reset
    // Since sessions is a private module-level variable, we can't easily reset it without a reset method.
    // However, createSession generates unique IDs, so collision is unlikely.
  });

  describe('initialize', () => {
    it('should load face-api models', async () => {
      await LivenessService.initialize();
      expect(faceapi.nets.ssdMobilenetv1.loadFromDisk).toHaveBeenCalled();
      expect(faceapi.nets.faceLandmark68Net.loadFromDisk).toHaveBeenCalled();
    });
  });

  describe('createSession', () => {
    it('should create a new liveness session', async () => {
      const session = await LivenessService.createSession('user-123');
      expect(session).toHaveProperty('id');
      expect(session.userId).toBe('user-123');
      expect(session.status).toBe('PENDING');
      expect(['BLINK', 'ZOOM_IN']).toContain(session.challenge);
    });
  });

  describe('processFrame', () => {
    let sessionId: string;
    let mockDetections: any;

    beforeEach(async () => {
      const session = await LivenessService.createSession('user-test');
      sessionId = session.id;

      // Mock loadImage
      (loadImage as jest.Mock).mockResolvedValue({});

      // Setup default mock for face detection (Open Eyes)
      // EAR = (10 + 10) / (2 * 20) = 0.5
      const openEyeLeft = [
        { x: 0, y: 10 }, { x: 5, y: 5 }, { x: 15, y: 5 },
        { x: 20, y: 10 }, { x: 15, y: 15 }, { x: 5, y: 15 }
      ];
      const openEyeRight = [
        { x: 50, y: 10 }, { x: 55, y: 5 }, { x: 65, y: 5 },
        { x: 70, y: 10 }, { x: 65, y: 15 }, { x: 55, y: 15 }
      ];

      mockDetections = {
        landmarks: {
          getLeftEye: jest.fn().mockReturnValue(openEyeLeft),
          getRightEye: jest.fn().mockReturnValue(openEyeRight)
        },
        detection: {
          box: { width: 100, height: 100 }
        }
      };

      (faceapi.detectSingleFace as jest.Mock).mockReturnValue({
        withFaceLandmarks: jest.fn().mockResolvedValue(mockDetections)
      });
    });

    it('should throw error if session not found', async () => {
      await expect(LivenessService.processFrame('invalid-id', Buffer.from('')))
        .rejects.toThrow('Session not found');
    });

    it('should return isLive: false if no face detected', async () => {
      (faceapi.detectSingleFace as jest.Mock).mockReturnValue({
        withFaceLandmarks: jest.fn().mockResolvedValue(null)
      });

      const result = await LivenessService.processFrame(sessionId, Buffer.from('img'));
      expect(result.isLive).toBe(false);
      expect(result.details?.faceDetected).toBe(false);
    });

    it('should detect blinking', async () => {
      // Force BLINK challenge
      let session;
      do {
        session = await LivenessService.createSession('user-blink');
      } while (session.challenge !== 'BLINK');
      
      // 1. Open Eyes (EAR = 0.5)
      let result = await LivenessService.processFrame(session.id, Buffer.from('img'));
      expect(result.isLive).toBe(false);

      // 2. Closed Eyes (EAR = 0.1)
      // EAR = (2 + 2) / (2 * 20) = 0.1
      const closedEyeLeft = [
        { x: 0, y: 10 }, { x: 5, y: 9 }, { x: 15, y: 9 },
        { x: 20, y: 10 }, { x: 15, y: 11 }, { x: 5, y: 11 }
      ];
      const closedEyeRight = [
        { x: 50, y: 10 }, { x: 55, y: 9 }, { x: 65, y: 9 },
        { x: 70, y: 10 }, { x: 65, y: 11 }, { x: 55, y: 11 }
      ];

      mockDetections.landmarks.getLeftEye.mockReturnValue(closedEyeLeft);
      mockDetections.landmarks.getRightEye.mockReturnValue(closedEyeRight);
      
      result = await LivenessService.processFrame(session.id, Buffer.from('img'));
      expect(result.isLive).toBe(false);

      // 3. Open Eyes Again -> Pass
      const openEyeLeft = [
        { x: 0, y: 10 }, { x: 5, y: 5 }, { x: 15, y: 5 },
        { x: 20, y: 10 }, { x: 15, y: 15 }, { x: 5, y: 15 }
      ];
      const openEyeRight = [
        { x: 50, y: 10 }, { x: 55, y: 5 }, { x: 65, y: 5 },
        { x: 70, y: 10 }, { x: 65, y: 15 }, { x: 55, y: 15 }
      ];
      mockDetections.landmarks.getLeftEye.mockReturnValue(openEyeLeft);
      mockDetections.landmarks.getRightEye.mockReturnValue(openEyeRight);

      result = await LivenessService.processFrame(session.id, Buffer.from('img'));
      expect(result.isLive).toBe(true);
      expect(result.details?.blinkDetected).toBe(true);
    });

    it('should detect zoom in', async () => {
      // Force ZOOM_IN challenge
      let session;
      do {
        session = await LivenessService.createSession('user-zoom');
      } while (session.challenge !== 'ZOOM_IN');

      // 1. Initial Frame
      mockDetections.detection.box = { width: 100, height: 100 }; // Area 10000
      let result = await LivenessService.processFrame(session.id, Buffer.from('img'));
      expect(result.isLive).toBe(false);

      // 2. Zoomed Frame (> 1.3x growth)
      // Target area > 13000. 120x120 = 14400
      mockDetections.detection.box = { width: 120, height: 120 };
      result = await LivenessService.processFrame(session.id, Buffer.from('img'));
      expect(result.isLive).toBe(true);
    });
  });
});
