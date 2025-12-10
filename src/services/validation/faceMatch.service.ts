import * as faceapi from 'face-api.js';
import { loadImage } from 'canvas';
import { LivenessService } from '../../services/liveness.service';

export class FaceMatchService {
  static async initialize() {
    await LivenessService.initialize();
  }

  static async compare(docBuffer: Buffer, liveBuffer: Buffer) {
    await this.initialize();

    const [docImg, liveImg] = await Promise.all([loadImage(docBuffer), loadImage(liveBuffer)]);
    const [docDet, liveDet] = await Promise.all([
      faceapi.detectSingleFace(docImg as any).withFaceLandmarks(),
      faceapi.detectSingleFace(liveImg as any).withFaceLandmarks(),
    ]);

    if (!docDet || !liveDet) {
      return { match: false, score: 0, reason: 'FACE_NOT_DETECTED' };
    }

    const docF = this.features(docDet.landmarks);
    const liveF = this.features(liveDet.landmarks);

    // Euclidean distance across normalized features
    const dist = Math.sqrt(
      docF.reduce((acc, v, i) => acc + Math.pow(v - liveF[i], 2), 0)
    );

    const score = Math.exp(-dist); // 1 ~ identical, 0 ~ different
    const match = score > 0.6; // heuristic threshold
    return { match, score };
  }

  private static center(points: any[]) {
    const x = points.reduce((a, p) => a + p.x, 0) / points.length;
    const y = points.reduce((a, p) => a + p.y, 0) / points.length;
    return { x, y };
  }

  private static dist(a: any, b: any) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  private static features(landmarks: faceapi.FaceLandmarks68) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const mouth = landmarks.getMouth();
    const nose = landmarks.getNose();
    const jaw = landmarks.getJawOutline();

    const le = this.center(leftEye);
    const re = this.center(rightEye);
    const noseTip = nose[Math.floor(nose.length / 2)];
    const mouthLeft = mouth[0];
    const mouthRight = mouth[6];
    const chin = jaw[8];

    const faceWidth = this.dist(leftEye[0], rightEye[3]);
    const norm = (v: number) => v / (faceWidth || 1);

    const eyeDist = norm(this.dist(le, re));
    const noseToChin = norm(this.dist(noseTip, chin));
    const mouthWidth = norm(this.dist(mouthLeft, mouthRight));
    const noseToMouth = norm(this.dist(noseTip, this.center(mouth)));

    return [eyeDist, noseToChin, mouthWidth, noseToMouth];
  }
}
