//! Error types for NicheFinder

use thiserror::Error;

/// Result type alias for NicheFinder operations
pub type Result<T> = std::result::Result<T, Error>;

/// NicheFinder error types
#[derive(Error, Debug)]
pub enum Error {
    /// UDM-related errors
    #[error("UDM error: {0}")]
    Udm(#[from] udm_core::UdmError),

    /// Data source errors
    #[error("Data source error: {0}")]
    DataSource(String),

    /// Scoring errors
    #[error("Scoring error: {0}")]
    Scoring(String),

    /// Report generation errors
    #[error("Report generation error: {0}")]
    Reporting(String),

    /// Configuration errors
    #[error("Configuration error: {0}")]
    Config(String),

    /// Serialization errors
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    /// Generic errors
    #[error("{0}")]
    Other(#[from] anyhow::Error),
}

