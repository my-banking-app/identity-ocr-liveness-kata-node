import { FaceMatchService } from '../../../../src/services/validation/faceMatch.service';
import * as faceapi from 'face-api.js';

jest.mock('face-api.js', () => ({
  env: { monkeyPatch: jest.fn() },
  nets: {
    ssdMobilenetv1: { loadFromDisk: jest.fn() },
    faceLandmark68Net: { loadFromDisk: jest.fn() },
  },
  detectSingleFace: jest.fn(),
}));

jest.mock('canvas', () => ({ loadImage: jest.fn() }));

describe('FaceMatchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return match true for similar features', async () => {
    const landmarks = {
      getLeftEye: () => [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 1 }],
      getRightEye: () => [{ x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 7, y: 1 }, { x: 6, y: 1 }],
      getMouth: () => Array(7).fill(0).map((_, i) => ({ x: i, y: 2 })),
      getNose: () => Array(5).fill(0).map((_, i) => ({ x: 4, y: i })),
      getJawOutline: () => Array(17).fill(0).map((_, i) => ({ x: i, y: 3 })),
    } as any;

    (faceapi.detectSingleFace as jest.Mock).mockReturnValueOnce({ withFaceLandmarks: jest.fn().mockResolvedValue({ landmarks }) })
      .mockReturnValueOnce({ withFaceLandmarks: jest.fn().mockResolvedValue({ landmarks }) });

    const res = await FaceMatchService.compare(Buffer.from('doc'), Buffer.from('live'));
    expect(res.match).toBe(true);
    expect(res.score).toBeGreaterThan(0.6);
  });

  it('should return match false when face not detected', async () => {
    (faceapi.detectSingleFace as jest.Mock).mockReturnValueOnce({ withFaceLandmarks: jest.fn().mockResolvedValue(null) })
      .mockReturnValueOnce({ withFaceLandmarks: jest.fn().mockResolvedValue(null) });
    const res = await FaceMatchService.compare(Buffer.from('doc'), Buffer.from('live'));
    expect(res.match).toBe(false);
    expect(res.reason).toBe('FACE_NOT_DETECTED');
  });
});
