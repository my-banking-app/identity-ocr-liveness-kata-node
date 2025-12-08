export interface MultiFactorScores {
  ocr_confidence: number;        // 0-100
  liveness_score: number;        // 0-100
  deepfake_probability: number;  // 0-100 (high prob = fake)
  document_validity: number;     // 0-100 (from database/logic checks)
  llm_consistency: number;       // 0-100
}

export interface FinalScore {
  ocr_confidence: number;
  liveness_score: number;
  deepfake_probability: number;
  document_validity: number;
  llm_consistency: number;
  final_risk_score: number;      // 0-100 (0=low risk)
  recommendation: 'approve' | 'reject' | 'review';
}

export class ScoringEngineService {
  static calculateFinalScore(scores: MultiFactorScores): FinalScore {
    // Kill switch: If deepfake probability is very high, reject immediately
    if (scores.deepfake_probability > 85) {
      return {
        ...scores,
        final_risk_score: 100,
        recommendation: 'reject'
      };
    }

    // Weights configuration
    const weights = {
      ocr_confidence: 0.15,
      liveness_score: 0.25,
      deepfake_probability: 0.25, // This needs to be inverted (100 - prob) for positive scoring
      document_validity: 0.20,
      llm_consistency: 0.15
    };

    // Normalize deepfake to "authenticity score"
    const deepfakeAuthenticity = 100 - scores.deepfake_probability;

    const weightedScore = 
      (scores.ocr_confidence * weights.ocr_confidence) +
      (scores.liveness_score * weights.liveness_score) +
      (deepfakeAuthenticity * weights.deepfake_probability) +
      (scores.document_validity * weights.document_validity) +
      (scores.llm_consistency * weights.llm_consistency);
    
    // Risk score is inverse of weighted authenticity score
    const riskScore = 100 - weightedScore;

    let recommendation: 'approve' | 'reject' | 'review';
    if (riskScore < 20) {
      recommendation = 'approve';
    } else if (riskScore < 50) {
      recommendation = 'review';
    } else {
      recommendation = 'reject';
    }

    return {
      ...scores,
      final_risk_score: Math.round(riskScore * 100) / 100,
      recommendation
    };
  }
}
