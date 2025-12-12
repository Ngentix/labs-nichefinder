//! Configuration management

use serde::{Deserialize, Serialize};

/// Server configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    /// Server host
    pub host: String,
    
    /// Server port
    pub port: u16,
    
    /// Database URL
    pub database_url: String,
    
    /// Scheduler configuration
    pub scheduler: SchedulerConfig,
}

/// Scheduler configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerConfig {
    /// Enable scheduler
    pub enabled: bool,
    
    /// Cron expression for analysis runs
    pub cron_expression: String,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            host: "0.0.0.0".to_string(),
            port: 3000,
            database_url: "sqlite://nichefinder.db".to_string(),
            scheduler: SchedulerConfig::default(),
        }
    }
}

impl Default for SchedulerConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            // Run daily at 2 AM
            cron_expression: "0 0 2 * * *".to_string(),
        }
    }
}

