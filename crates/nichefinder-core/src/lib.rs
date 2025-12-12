//! NicheFinder Core Library
//!
//! This library provides the core functionality for identifying underserved
//! integration opportunities in the Home Assistant ecosystem.

pub mod error;
pub mod types;
pub mod scoring;
pub mod reporting;
pub mod collectors;
pub mod connector_gen;

// Re-export commonly used types
pub use error::{Error, Result};
pub use types::{
    NicheOpportunity, IntegrationScore, DataSource, AnalysisConfig,
};
pub use scoring::OpportunityScorer;
pub use reporting::ReportGenerator;

/// Library version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

