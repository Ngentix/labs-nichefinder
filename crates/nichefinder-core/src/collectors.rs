//! Data collectors for various sources (HACS, GitHub, Reddit)

use crate::error::{Error, Result};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use udm_connectors::plugins::{ApiConnector, RestApiConnector, rest_api::RestApiConfig};

/// Trait for data collectors
#[async_trait]
pub trait DataCollector: Send + Sync {
    /// Collect data from the source
    async fn collect(&self) -> Result<Vec<CollectedData>>;
    
    /// Get the source name
    fn source_name(&self) -> &str;
}

/// Generic collected data from any source
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollectedData {
    pub source: String,
    pub data_type: String,
    pub raw_data: serde_json::Value,
    pub collected_at: chrono::DateTime<chrono::Utc>,
}

/// HACS (Home Assistant Community Store) data collector
pub struct HacsCollector {
    connector: RestApiConnector,
}

/// HACS integration metadata from data.json
/// All fields are optional except manifest, domain, and full_name which are always present
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HacsIntegration {
    pub manifest: HacsManifest,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub downloads: Option<u64>,
    pub domain: String,
    pub full_name: String,
    #[serde(default)]
    pub last_updated: Option<String>,
    #[serde(default)]
    pub last_version: Option<String>,
    #[serde(default)]
    pub manifest_name: Option<String>,
    #[serde(default)]
    pub stargazers_count: Option<u64>,
    #[serde(default)]
    pub topics: Vec<String>,
    #[serde(default)]
    pub open_issues: Option<u64>,
    #[serde(default)]
    pub last_commit: Option<String>,
    #[serde(default)]
    pub etag_releases: Option<String>,
    #[serde(default)]
    pub etag_repository: Option<String>,
    #[serde(default)]
    pub last_fetched: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HacsManifest {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub country: Vec<String>,
}

impl HacsCollector {
    /// Create a new HACS collector
    pub async fn new() -> Result<Self> {
        let mut config = RestApiConfig::default();
        config.base_url = "https://data-v2.hacs.xyz".to_string();
        config.timeout_seconds = 30;

        let connector = RestApiConnector::with_config(config)
            .await
            .map_err(|e| Error::Udm(udm_core::UdmError::Generic(e.to_string())))?;

        Ok(Self { connector })
    }

    /// Fetch all integration data from HACS
    pub async fn fetch_integrations(&self) -> Result<HashMap<String, HacsIntegration>> {
        // HACS data is at /integration/data.json
        // Use the ApiConnector trait's get method
        let response = self.connector.get("/integration/data.json", None)
            .await
            .map_err(|e| Error::Udm(udm_core::UdmError::Generic(e.to_string())))?;

        // Parse the response
        let integrations: HashMap<String, HacsIntegration> = serde_json::from_value(response)
            .map_err(|e| Error::Serialization(e))?;

        Ok(integrations)
    }
}

#[async_trait]
impl DataCollector for HacsCollector {
    async fn collect(&self) -> Result<Vec<CollectedData>> {
        let integrations = self.fetch_integrations().await?;
        
        let collected_data = integrations
            .into_iter()
            .map(|(id, integration)| CollectedData {
                source: "hacs".to_string(),
                data_type: "integration".to_string(),
                raw_data: serde_json::to_value(&integration).unwrap_or_default(),
                collected_at: chrono::Utc::now(),
            })
            .collect();
        
        Ok(collected_data)
    }
    
    fn source_name(&self) -> &str {
        "HACS"
    }
}

/// GitHub data collector (placeholder for now)
pub struct GitHubCollector {
    // TODO: Implement GitHub API connector
}

impl GitHubCollector {
    pub async fn new() -> Result<Self> {
        Ok(Self {})
    }
}

#[async_trait]
impl DataCollector for GitHubCollector {
    async fn collect(&self) -> Result<Vec<CollectedData>> {
        // TODO: Implement GitHub data collection
        Ok(vec![])
    }
    
    fn source_name(&self) -> &str {
        "GitHub"
    }
}

/// Reddit data collector (placeholder for now)
pub struct RedditCollector {
    // TODO: Implement Reddit API connector
}

impl RedditCollector {
    pub async fn new() -> Result<Self> {
        Ok(Self {})
    }
}

#[async_trait]
impl DataCollector for RedditCollector {
    async fn collect(&self) -> Result<Vec<CollectedData>> {
        // TODO: Implement Reddit data collection
        Ok(vec![])
    }
    
    fn source_name(&self) -> &str {
        "Reddit"
    }
}

