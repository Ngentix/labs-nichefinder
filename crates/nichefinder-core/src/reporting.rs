//! Report generation for niche opportunities

use crate::{Error, Result};
use crate::types::{AnalysisResult, NicheOpportunity};
use serde::Serialize;

/// Trait for generating reports
pub trait ReportGenerator: Send + Sync {
    /// Generate a report in the specified format
    fn generate(&self, result: &AnalysisResult, format: ReportFormat) -> Result<String>;
}

/// Report output format
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ReportFormat {
    /// JSON format
    Json,
    
    /// Markdown format
    Markdown,
    
    /// Plain text format
    Text,
}

/// Default report generator
pub struct DefaultReportGenerator;

impl DefaultReportGenerator {
    /// Create a new report generator
    pub fn new() -> Self {
        Self
    }
    
    /// Generate JSON report
    fn generate_json(&self, result: &AnalysisResult) -> Result<String> {
        serde_json::to_string_pretty(result)
            .map_err(|e| Error::Reporting(format!("JSON serialization failed: {}", e)))
    }
    
    /// Generate Markdown report
    fn generate_markdown(&self, result: &AnalysisResult) -> Result<String> {
        let mut md = String::new();
        
        md.push_str("# NicheFinder Analysis Report\n\n");
        md.push_str(&format!("**Analysis Date:** {}\n\n", result.analyzed_at.format("%Y-%m-%d %H:%M:%S UTC")));
        md.push_str(&format!("**Total Candidates:** {}\n", result.metadata.total_candidates));
        md.push_str(&format!("**Qualified Opportunities:** {}\n", result.metadata.qualified_candidates));
        md.push_str(&format!("**Analysis Duration:** {:.2}s\n\n", result.metadata.duration_secs));
        
        md.push_str("## Top Opportunities\n\n");
        
        for (idx, opp) in result.opportunities.iter().enumerate() {
            md.push_str(&format!("### {}. {} (Score: {:.1})\n\n", idx + 1, opp.name, opp.score));
            md.push_str(&format!("**Category:** {}\n\n", opp.category));
            
            md.push_str("**Scoring Breakdown:**\n");
            md.push_str(&format!("- Demand: {:.1}\n", opp.scoring_details.demand));
            md.push_str(&format!("- Feasibility: {:.1}\n", opp.scoring_details.feasibility));
            md.push_str(&format!("- Competition: {:.1}\n", opp.scoring_details.competition));
            md.push_str(&format!("- Trend: {:.1}\n\n", opp.scoring_details.trend));
            
            md.push_str(&format!("**Data Sources:** {}\n\n", 
                opp.data_sources.iter()
                    .map(|s| s.name.as_str())
                    .collect::<Vec<_>>()
                    .join(", ")
            ));
            
            md.push_str("---\n\n");
        }
        
        Ok(md)
    }
    
    /// Generate plain text report
    fn generate_text(&self, result: &AnalysisResult) -> Result<String> {
        let mut text = String::new();
        
        text.push_str("NICHEFINDER ANALYSIS REPORT\n");
        text.push_str("===========================\n\n");
        text.push_str(&format!("Analysis Date: {}\n", result.analyzed_at.format("%Y-%m-%d %H:%M:%S UTC")));
        text.push_str(&format!("Total Candidates: {}\n", result.metadata.total_candidates));
        text.push_str(&format!("Qualified Opportunities: {}\n", result.metadata.qualified_candidates));
        text.push_str(&format!("Analysis Duration: {:.2}s\n\n", result.metadata.duration_secs));
        
        text.push_str("TOP OPPORTUNITIES\n");
        text.push_str("-----------------\n\n");
        
        for (idx, opp) in result.opportunities.iter().enumerate() {
            text.push_str(&format!("{}. {} (Score: {:.1})\n", idx + 1, opp.name, opp.score));
            text.push_str(&format!("   Category: {}\n", opp.category));
            text.push_str(&format!("   Demand: {:.1} | Feasibility: {:.1} | Competition: {:.1} | Trend: {:.1}\n",
                opp.scoring_details.demand,
                opp.scoring_details.feasibility,
                opp.scoring_details.competition,
                opp.scoring_details.trend
            ));
            text.push_str(&format!("   Sources: {}\n\n",
                opp.data_sources.iter()
                    .map(|s| s.name.as_str())
                    .collect::<Vec<_>>()
                    .join(", ")
            ));
        }
        
        Ok(text)
    }
}

impl Default for DefaultReportGenerator {
    fn default() -> Self {
        Self::new()
    }
}

impl ReportGenerator for DefaultReportGenerator {
    fn generate(&self, result: &AnalysisResult, format: ReportFormat) -> Result<String> {
        match format {
            ReportFormat::Json => self.generate_json(result),
            ReportFormat::Markdown => self.generate_markdown(result),
            ReportFormat::Text => self.generate_text(result),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::*;
    use chrono::Utc;
    use uuid::Uuid;
    
    fn create_test_result() -> AnalysisResult {
        AnalysisResult {
            opportunities: vec![],
            analyzed_at: Utc::now(),
            config: AnalysisConfig::default(),
            metadata: AnalysisMetadata {
                total_candidates: 100,
                qualified_candidates: 10,
                duration_secs: 5.5,
                sources_used: vec!["github".to_string()],
            },
        }
    }
    
    #[test]
    fn test_json_generation() {
        let generator = DefaultReportGenerator::new();
        let result = create_test_result();
        let report = generator.generate(&result, ReportFormat::Json).unwrap();
        assert!(report.contains("opportunities"));
    }
}

