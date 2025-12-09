export interface MultiFactorScores {
  ocr_confidence: number;
  liveness_score: number;
  deepfake_probability: number;
  document_validity: number;
  llm_consistency: number;
}

export interface FinalScore {
  ocr_confidence: number;
  liveness_score: number;
  deepfake_probability: number;
  document_validity: number;
  llm_consistency: number;
  final_risk_score: number;
  recommendation: 'approve' | 'reject' | 'review';
}

export class ScoringEngineService {
  static calculateFinalScore(scores: MultiFactorScores): FinalScore {
    if (scores.deepfake_probability > 85) {
      return {
        ...scores,
        final_risk_score: 100,
        recommendation: 'reject',
      };
    }

    const weights = {
      ocr_confidence: 0.15,
      liveness_score: 0.25,
      deepfake_probability: 0.25,
      document_validity: 0.2,
      llm_consistency: 0.15,
    };

    const deepfakeAuthenticity = 100 - scores.deepfake_probability;

    const weightedScore =
      scores.ocr_confidence * weights.ocr_confidence +
      scores.liveness_score * weights.liveness_score +
      deepfakeAuthenticity * weights.deepfake_probability +
      scores.document_validity * weights.document_validity +
      scores.llm_consistency * weights.llm_consistency;

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
      recommendation,
    };
  }
}

