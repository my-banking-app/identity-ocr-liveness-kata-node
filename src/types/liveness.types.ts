export type LivenessChallengeType = 'BLINK' | 'SMILE' | 'TURN_LEFT' | 'TURN_RIGHT' | 'ZOOM_IN';

export interface LivenessSession {
  id: string;
  userId: string;
  challenge: LivenessChallengeType;
  status: 'PENDING' | 'PASSED' | 'FAILED';
  createdAt: Date;
  attempts: number;
  lastFaceArea?: number;
  initialFaceArea?: number;
}

export interface FaceAnalysisResult {
  isLive: boolean;
  score: number;
  details?: {
    blinkDetected?: boolean;
    ear?: number;
    faceDetected?: boolean;
  };
}

export interface Point {
  x: number;
  y: number;
}
