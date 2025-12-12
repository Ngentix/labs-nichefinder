//! Scoring algorithms for integration opportunities

use crate::{Error, Result};
use crate::types::{IntegrationScore, ScoreWeights};

/// Trait for scoring integration opportunities
pub trait OpportunityScorer: Send + Sync {
    /// Calculate a score for an integration opportunity
    fn score(&self, data: &ScoringData) -> Result<IntegrationScore>;
}

/// Data used for scoring
#[derive(Debug, Clone)]
pub struct ScoringData {
    /// Number of user requests/mentions
    pub request_count: usize,
    
    /// Growth rate (requests per day)
    pub growth_rate: f64,
    
    /// API availability (true if public API exists)
    pub has_api: bool,
    
    /// API documentation quality (0.0 - 1.0)
    pub api_quality: f64,
    
    /// Number of existing integrations
    pub existing_integrations: usize,
    
    /// Recency of requests (days since last request)
    pub days_since_last_request: u32,
}

/// Default scorer implementation
pub struct DefaultScorer {
    weights: ScoreWeights,
}

impl DefaultScorer {
    /// Create a new scorer with default weights
    pub fn new() -> Self {
        Self {
            weights: ScoreWeights::default(),
        }
    }
    
    /// Create a new scorer with custom weights
    pub fn with_weights(weights: ScoreWeights) -> Self {
        Self { weights }
    }
    
    /// Calculate demand score based on request volume and recency
    fn calculate_demand(&self, data: &ScoringData) -> f64 {
        let volume_score = (data.request_count as f64).min(100.0);
        let recency_score = if data.days_since_last_request == 0 {
            100.0
        } else {
            (100.0 / (1.0 + data.days_since_last_request as f64 / 30.0)).min(100.0)
        };
        
        // Weighted average of volume and recency
        (volume_score * 0.7 + recency_score * 0.3).min(100.0)
    }
    
    /// Calculate feasibility score based on API availability
    fn calculate_feasibility(&self, data: &ScoringData) -> f64 {
        if !data.has_api {
            return 20.0; // Low but not zero - reverse engineering possible
        }
        
        // Scale API quality to 0-100
        let api_score = data.api_quality * 100.0;
        
        // Bonus for good documentation
        if api_score > 80.0 {
            100.0
        } else {
            api_score
        }
    }
    
    /// Calculate competition score (inverse - lower existing integrations = higher score)
    fn calculate_competition(&self, data: &ScoringData) -> f64 {
        match data.existing_integrations {
            0 => 100.0, // No competition
            1 => 70.0,  // One competitor
            2 => 50.0,  // Two competitors
            3 => 30.0,  // Three competitors
            _ => 10.0,  // Saturated market
        }
    }
    
    /// Calculate trend score based on growth rate
    fn calculate_trend(&self, data: &ScoringData) -> f64 {
        if data.growth_rate <= 0.0 {
            return 0.0;
        }
        
        // Logarithmic scaling for growth rate
        let trend_score = (data.growth_rate.ln() * 20.0).min(100.0).max(0.0);
        trend_score
    }
    
    /// Calculate composite score using weights
    fn calculate_composite(&self, score: &IntegrationScore) -> f64 {
        let composite = score.demand * self.weights.demand
            + score.feasibility * self.weights.feasibility
            + score.competition * self.weights.competition
            + score.trend * self.weights.trend;
        
        composite.min(100.0).max(0.0)
    }
}

impl Default for DefaultScorer {
    fn default() -> Self {
        Self::new()
    }
}

impl OpportunityScorer for DefaultScorer {
    fn score(&self, data: &ScoringData) -> Result<IntegrationScore> {
        let demand = self.calculate_demand(data);
        let feasibility = self.calculate_feasibility(data);
        let competition = self.calculate_competition(data);
        let trend = self.calculate_trend(data);
        
        let mut score = IntegrationScore {
            demand,
            feasibility,
            competition,
            trend,
            composite: 0.0,
            weights: self.weights.clone(),
        };
        
        score.composite = self.calculate_composite(&score);
        
        Ok(score)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_scoring_high_demand() {
        let scorer = DefaultScorer::new();
        let data = ScoringData {
            request_count: 100,
            growth_rate: 2.0,
            has_api: true,
            api_quality: 0.9,
            existing_integrations: 0,
            days_since_last_request: 1,
        };
        
        let score = scorer.score(&data).unwrap();
        assert!(score.demand > 80.0);
        assert!(score.feasibility > 80.0);
        assert_eq!(score.competition, 100.0);
        assert!(score.composite > 70.0);
    }
}

