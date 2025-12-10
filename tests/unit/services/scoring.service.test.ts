import { ScoringEngineService, MultiFactorScores } from '../../../src/services/llm/scoringEngine.service';

describe('ScoringEngineService', () => {
  it('should approve a low risk profile', () => {
    const scores: MultiFactorScores = {
      ocr_confidence: 95,
      liveness_score: 98,
      deepfake_probability: 2, // Low probability of deepfake = High authenticity
      document_validity: 100,
      llm_consistency: 90
    };

    const result = ScoringEngineService.calculateFinalScore(scores);
    
    // Authenticity score approx: 
    // (95*0.15) + (98*0.25) + (98*0.25) + (100*0.20) + (90*0.15)
    // 14.25 + 24.5 + 24.5 + 20 + 13.5 = 96.75
    // Risk score = 100 - 96.75 = 3.25
    
    expect(result.final_risk_score).toBeLessThan(20);
    expect(result.recommendation).toBe('approve');
  });

  it('should reject a high deepfake probability', () => {
    const scores: MultiFactorScores = {
      ocr_confidence: 90,
      liveness_score: 80,
      deepfake_probability: 95, // High probability of deepfake = Low authenticity (5)
      document_validity: 90,
      llm_consistency: 85
    };

    const result = ScoringEngineService.calculateFinalScore(scores);
    
    // Deepfake authenticity = 100 - 95 = 5
    // Weight of deepfake is 0.25, so this severely impacts the score.
    
    expect(result.recommendation).toBe('reject');
  });

  it('should flag for review on borderline cases', () => {
    const scores: MultiFactorScores = {
      ocr_confidence: 70,
      liveness_score: 60,
      deepfake_probability: 40, // Authenticity 60
      document_validity: 80,
      llm_consistency: 60
    };

    const result = ScoringEngineService.calculateFinalScore(scores);
    expect(result.recommendation).toBe('review');
  });
});
