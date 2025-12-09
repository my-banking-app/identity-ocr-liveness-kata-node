import * as faceapi from 'face-api.js';
import { Canvas, Image, ImageData, loadImage } from 'canvas';
import * as tf from '@tensorflow/tfjs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { LivenessSession, LivenessChallengeType, FaceAnalysisResult, Point } from '../types/liveness.types';
import logger from '../utils/logger';

// Configure face-api environment
faceapi.env.monkeyPatch({ Canvas: Canvas as any, Image: Image as any, ImageData: ImageData as any });

const MODELS_PATH = path.join(__dirname, '../models');

// In-memory session store
const sessions: Map<string, LivenessSession & { blinkState?: 'OPEN' | 'CLOSED' }> = new Map();

export class LivenessService {
  private static modelsLoaded = false;

  static async initialize() {
    if (this.modelsLoaded) return;

    try {
      logger.info('Loading Face API models...');
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
      this.modelsLoaded = true;
      logger.info('Face API models loaded successfully');
    } catch (error) {
      logger.error('Failed to load Face API models', error);
      throw error;
    }
  }

  static async createSession(userId: string, challenge?: LivenessChallengeType): Promise<LivenessSession> {
    const selected: LivenessChallengeType = challenge || 'ZOOM_IN';

    const session: LivenessSession = {
      id: uuidv4(),
      userId,
      challenge: selected,
      status: 'PENDING',
      createdAt: new Date(),
      attempts: 0,
    };
    
    sessions.set(session.id, { ...session, blinkState: 'OPEN' });
    return session;
  }

  static async getSession(sessionId: string): Promise<LivenessSession | null> {
    return sessions.get(sessionId) || null;
  }

  static async processFrame(sessionId: string, imageBuffer: Buffer): Promise<FaceAnalysisResult> {
    const session = sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'PENDING') {
      return { isLive: session.status === 'PASSED', score: 0 };
    }

    if (!this.modelsLoaded) await this.initialize();

    try {
      const img = await loadImage(imageBuffer);
      const detections = await faceapi.detectSingleFace(img as any).withFaceLandmarks();

      if (!detections) {
        return { isLive: false, score: 0, details: { faceDetected: false } };
      }

      const landmarks = detections.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      const leftEAR = this.calculateEAR(leftEye);
      const rightEAR = this.calculateEAR(rightEye);
      const avgEAR = (leftEAR + rightEAR) / 2;

      // Blink detection logic
      // EAR threshold: < 0.2 usually indicates closed eyes
      const isEyesClosed = avgEAR < 0.25;

      // console.log(`[Liveness Debug] Session: ${sessionId}, Challenge: ${session.challenge}, BlinkState: ${session.blinkState}, avgEAR: ${avgEAR}, isEyesClosed: ${isEyesClosed}`);

      let blinkDetected = false;

      if (session.challenge === 'BLINK') {
        if (session.blinkState === 'OPEN' && isEyesClosed) {
          session.blinkState = 'CLOSED';
          // console.log(`[Liveness Debug] Transitioned to CLOSED`);
        } else if (session.blinkState === 'CLOSED' && !isEyesClosed) {
           // Transition Closed -> Open: Blink Completed
           session.status = 'PASSED';
           session.blinkState = 'OPEN';
           blinkDetected = true;
           // console.log(`[Liveness Debug] Transitioned to OPEN (PASSED)`);
        }
      }

      // Zoom logic
      if (session.challenge === 'ZOOM_IN') {
        const box = detections.detection.box;
        const area = box.width * box.height;
        
        if (!session.initialFaceArea) {
          session.initialFaceArea = area;
        }

        const growth = area / session.initialFaceArea;
        // Require 30% increase
        if (growth > 1.3) {
           session.status = 'PASSED';
        }
      }

      sessions.set(sessionId, session);

      return {
        isLive: session.status === 'PASSED',
        score: avgEAR,
        details: {
          blinkDetected,
          ear: avgEAR,
          faceDetected: true,
        },
      };

    } catch (error) {
      logger.error('Error processing frame', error);
      throw error;
    }
  }

  private static calculateEAR(eye: faceapi.Point[]): number {
    // EAR = (|p2 - p6| + |p3 - p5|) / (2 * |p1 - p4|)
    // Indices in eye array (0-5):
    // p1: 0 (left corner)
    // p2: 1 (top-left)
    // p3: 2 (top-right)
    // p4: 3 (right corner)
    // p5: 4 (bottom-right)
    // p6: 5 (bottom-left)

    const p1 = eye[0];
    const p2 = eye[1];
    const p3 = eye[2];
    const p4 = eye[3];
    const p5 = eye[4];
    const p6 = eye[5];

    const vertical1 = this.euclideanDistance(p2, p6);
    const vertical2 = this.euclideanDistance(p3, p5);
    const horizontal = this.euclideanDistance(p1, p4);

    return (vertical1 + vertical2) / (2.0 * horizontal);
  }

  private static euclideanDistance(p1: faceapi.Point, p2: faceapi.Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }
}
