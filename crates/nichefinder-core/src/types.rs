//! Core data types for NicheFinder

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Represents a potential integration opportunity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NicheOpportunity {
    /// Unique identifier
    pub id: Uuid,
    
    /// Name of the integration/device/service
    pub name: String,
    
    /// Category (e.g., "smart_home_device", "cloud_service")
    pub category: String,
    
    /// Overall opportunity score (0.0 - 100.0)
    pub score: f64,
    
    /// Detailed scoring breakdown
    pub scoring_details: IntegrationScore,
    
    /// Data sources used for analysis
    pub data_sources: Vec<DataSource>,
    
    /// When this opportunity was identified
    pub discovered_at: DateTime<Utc>,
    
    /// Additional metadata
    pub metadata: serde_json::Value,
}

/// Detailed scoring breakdown for an integration opportunity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrationScore {
    /// Demand score based on user requests (0.0 - 100.0)
    pub demand: f64,
    
    /// Feasibility score based on API availability (0.0 - 100.0)
    pub feasibility: f64,
    
    /// Competition score (inverse - lower is better) (0.0 - 100.0)
    pub competition: f64,
    
    /// Trend score based on growth trajectory (0.0 - 100.0)
    pub trend: f64,
    
    /// Weighted composite score
    pub composite: f64,
    
    /// Weights used for composite calculation
    pub weights: ScoreWeights,
}

/// Weights for composite score calculation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoreWeights {
    pub demand: f64,
    pub feasibility: f64,
    pub competition: f64,
    pub trend: f64,
}

impl Default for ScoreWeights {
    fn default() -> Self {
        Self {
            demand: 0.4,      // 40% - most important
            feasibility: 0.3, // 30%
            competition: 0.2, // 20%
            trend: 0.1,       // 10%
        }
    }
}

/// Data source information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSource {
    /// Source name (e.g., "github", "reddit", "hacs")
    pub name: String,
    
    /// Source type
    pub source_type: DataSourceType,
    
    /// When data was collected
    pub collected_at: DateTime<Utc>,
    
    /// Number of data points collected
    pub data_points: usize,
    
    /// Source-specific metadata
    pub metadata: serde_json::Value,
}

/// Type of data source
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum DataSourceType {
    /// GitHub issues/discussions
    GitHub,
    
    /// Reddit posts/comments
    Reddit,
    
    /// Home Assistant Community Store
    Hacs,
    
    /// Other source
    Other(String),
}

/// Configuration for niche analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisConfig {
    /// Minimum score threshold for reporting
    pub min_score: f64,
    
    /// Maximum number of opportunities to return
    pub max_results: usize,
    
    /// Score weights
    pub weights: ScoreWeights,
    
    /// Data sources to use
    pub enabled_sources: Vec<String>,
    
    /// Time range for analysis (days)
    pub time_range_days: u32,
}

impl Default for AnalysisConfig {
    fn default() -> Self {
        Self {
            min_score: 50.0,
            max_results: 20,
            weights: ScoreWeights::default(),
            enabled_sources: vec![
                "github".to_string(),
                "reddit".to_string(),
                "hacs".to_string(),
            ],
            time_range_days: 90,
        }
    }
}

/// Analysis result containing multiple opportunities
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    /// List of identified opportunities
    pub opportunities: Vec<NicheOpportunity>,
    
    /// When the analysis was performed
    pub analyzed_at: DateTime<Utc>,
    
    /// Configuration used
    pub config: AnalysisConfig,
    
    /// Analysis metadata
    pub metadata: AnalysisMetadata,
}

/// Metadata about the analysis run
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisMetadata {
    /// Total candidates evaluated
    pub total_candidates: usize,
    
    /// Candidates that met threshold
    pub qualified_candidates: usize,
    
    /// Duration of analysis in seconds
    pub duration_secs: f64,
    
    /// Data sources used
    pub sources_used: Vec<String>,
}

