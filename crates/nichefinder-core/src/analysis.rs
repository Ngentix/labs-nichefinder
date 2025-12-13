//! Analysis module for identifying integration opportunities

use crate::{
    Error, Result,
    types::{NicheOpportunity, IntegrationScore, DataSource, DataSourceType, AnalysisConfig, AnalysisResult, AnalysisMetadata},
    scoring::{OpportunityScorer, DefaultScorer, ScoringData},
    transform::{NormalizedIntegration, load_hacs_data, load_github_data, load_youtube_data, normalize_integrations},
};
use chrono::Utc;
use uuid::Uuid;
use std::time::Instant;

/// Analyzer for identifying integration opportunities
pub struct IntegrationAnalyzer {
    scorer: Box<dyn OpportunityScorer>,
    config: AnalysisConfig,
}

impl IntegrationAnalyzer {
    /// Create a new analyzer with default configuration
    pub fn new() -> Self {
        Self {
            scorer: Box::new(DefaultScorer::new()),
            config: AnalysisConfig::default(),
        }
    }
    
    /// Create a new analyzer with custom configuration
    pub fn with_config(config: AnalysisConfig) -> Self {
        let scorer = Box::new(DefaultScorer::with_weights(config.weights.clone()));
        Self { scorer, config }
    }
    
    /// Analyze integration opportunities from raw data files
    pub fn analyze_from_files(
        &self,
        hacs_path: &str,
        github_path: &str,
        youtube_path: &str,
    ) -> Result<AnalysisResult> {
        let start = Instant::now();
        
        // Load raw data
        let hacs_data = load_hacs_data(hacs_path)?;
        let github_data = load_github_data(github_path)?;
        let youtube_data = load_youtube_data(youtube_path)?;
        
        // Normalize data
        let normalized = normalize_integrations(hacs_data, github_data, youtube_data)?;
        
        // Analyze opportunities
        self.analyze_normalized(normalized, start)
    }
    
    /// Analyze normalized integration data
    fn analyze_normalized(
        &self,
        integrations: Vec<NormalizedIntegration>,
        start: Instant,
    ) -> Result<AnalysisResult> {
        let total_candidates = integrations.len();
        let mut opportunities = Vec::new();
        
        for integration in integrations {
            // Calculate scoring data
            let scoring_data = self.calculate_scoring_data(&integration);
            
            // Score the opportunity
            let score = self.scorer.score(&scoring_data)?;
            
            // Filter by minimum score threshold
            if score.composite >= self.config.min_score {
                let opportunity = self.create_opportunity(integration, score);
                opportunities.push(opportunity);
            }
        }
        
        // Sort by composite score (descending)
        opportunities.sort_by(|a, b| {
            b.scoring_details.composite
                .partial_cmp(&a.scoring_details.composite)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        
        // Limit to max_results
        opportunities.truncate(self.config.max_results);
        
        let qualified_candidates = opportunities.len();
        let duration_secs = start.elapsed().as_secs_f64();
        
        Ok(AnalysisResult {
            opportunities,
            analyzed_at: Utc::now(),
            config: self.config.clone(),
            metadata: AnalysisMetadata {
                total_candidates,
                qualified_candidates,
                duration_secs,
                sources_used: self.config.enabled_sources.clone(),
            },
        })
    }
    
    /// Calculate scoring data from normalized integration
    fn calculate_scoring_data(&self, integration: &NormalizedIntegration) -> ScoringData {
        // Demand: based on GitHub stars and YouTube mentions
        let request_count = (integration.stars as usize) + (integration.youtube_mentions as usize * 10);
        
        // Growth rate: estimate based on stars and recency
        let growth_rate = if integration.stars > 0 {
            integration.stars as f64 / 365.0 // Rough estimate: stars per day
        } else {
            0.0
        };
        
        // Feasibility: assume API exists if integration is in HACS
        let has_api = integration.in_hacs;
        let api_quality = if integration.in_hacs { 0.8 } else { 0.5 };
        
        // Competition: count as 1 if in HACS (existing integration)
        let existing_integrations = if integration.in_hacs { 1 } else { 0 };
        
        // Recency: days since last update
        let days_since_last_request = integration.last_updated
            .map(|dt| (Utc::now() - dt).num_days() as u32)
            .unwrap_or(365);
        
        ScoringData {
            request_count,
            growth_rate,
            has_api,
            api_quality,
            existing_integrations,
            days_since_last_request,
        }
    }
    
    /// Create a NicheOpportunity from normalized integration and score
    fn create_opportunity(
        &self,
        integration: NormalizedIntegration,
        score: IntegrationScore,
    ) -> NicheOpportunity {
        let data_sources = self.create_data_sources(&integration);

        NicheOpportunity {
            id: Uuid::new_v4(),
            name: integration.name.clone(),
            category: integration.domain.unwrap_or_else(|| "unknown".to_string()),
            score: score.composite,
            scoring_details: score,
            data_sources,
            discovered_at: Utc::now(),
            metadata: serde_json::json!({
                "github_url": integration.github_url,
                "stars": integration.stars,
                "forks": integration.forks,
                "open_issues": integration.open_issues,
                "topics": integration.topics,
                "in_hacs": integration.in_hacs,
                "youtube_mentions": integration.youtube_mentions,
            }),
        }
    }

    /// Create data sources from normalized integration
    fn create_data_sources(&self, integration: &NormalizedIntegration) -> Vec<DataSource> {
        let mut sources = Vec::new();

        // HACS source
        if let Some(hacs_id) = &integration.sources.hacs_id {
            sources.push(DataSource {
                name: "HACS".to_string(),
                source_type: DataSourceType::Hacs,
                collected_at: Utc::now(),
                data_points: 1,
                metadata: serde_json::json!({
                    "hacs_id": hacs_id,
                    "domain": integration.domain,
                }),
            });
        }

        // GitHub source
        if let Some(github_name) = &integration.sources.github_full_name {
            sources.push(DataSource {
                name: "GitHub".to_string(),
                source_type: DataSourceType::GitHub,
                collected_at: Utc::now(),
                data_points: 1,
                metadata: serde_json::json!({
                    "full_name": github_name,
                    "stars": integration.stars,
                    "forks": integration.forks,
                    "open_issues": integration.open_issues,
                }),
            });
        }

        // YouTube source - always include to show data was collected
        // Even if no exact match, shows general market intelligence
        if !integration.sources.youtube_video_ids.is_empty() {
            // Exact match found
            sources.push(DataSource {
                name: "YouTube".to_string(),
                source_type: DataSourceType::Other("YouTube".to_string()),
                collected_at: Utc::now(),
                data_points: integration.sources.youtube_video_ids.len(),
                metadata: serde_json::json!({
                    "video_ids": integration.sources.youtube_video_ids,
                    "mention_count": integration.youtube_mentions,
                    "match_type": "exact",
                }),
            });
        } else {
            // No exact match, but show general market data was collected
            sources.push(DataSource {
                name: "YouTube (general)".to_string(),
                source_type: DataSourceType::Other("YouTube".to_string()),
                collected_at: Utc::now(),
                data_points: 0,
                metadata: serde_json::json!({
                    "match_type": "general",
                    "note": "General Home Assistant market data collected, no integration-specific match",
                }),
            });
        }

        sources
    }
}

impl Default for IntegrationAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}

