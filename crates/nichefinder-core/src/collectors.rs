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

/// GitHub API response for repository data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubRepository {
    pub id: u64,
    pub name: String,
    pub full_name: String,
    pub description: Option<String>,
    pub html_url: String,
    pub stargazers_count: u64,
    pub watchers_count: u64,
    pub forks_count: u64,
    pub open_issues_count: u64,
    pub language: Option<String>,
    pub topics: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
    pub pushed_at: String,
    #[serde(default)]
    pub license: Option<GitHubLicense>,
    #[serde(default)]
    pub has_issues: bool,
    #[serde(default)]
    pub has_discussions: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubLicense {
    pub key: String,
    pub name: String,
    pub spdx_id: Option<String>,
}

/// GitHub API response for issue/PR data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubIssue {
    pub id: u64,
    pub number: u64,
    pub title: String,
    pub state: String,
    pub created_at: String,
    pub updated_at: String,
    pub closed_at: Option<String>,
    pub comments: u64,
    #[serde(default)]
    pub labels: Vec<GitHubLabel>,
    pub pull_request: Option<serde_json::Value>, // Present if this is a PR
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubLabel {
    pub name: String,
    pub color: String,
}

/// GitHub search API response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubSearchResponse {
    pub total_count: u64,
    pub incomplete_results: bool,
    pub items: Vec<GitHubRepository>,
}

/// GitHub collector for fetching repository and issue data
pub struct GitHubCollector {
    connector: RestApiConnector,
}

impl GitHubCollector {
    /// Create a new GitHub collector with optional authentication token
    /// Token should be a GitHub Personal Access Token (PAT)
    pub async fn new(token: Option<String>) -> Result<Self> {
        let mut config = RestApiConfig::default();
        config.base_url = "https://api.github.com".to_string();
        config.timeout_seconds = 30;

        // Add authentication header if token is provided
        if let Some(token) = token {
            config.default_headers.insert(
                "Authorization".to_string(),
                format!("Bearer {}", token),
            );
        }

        // GitHub API requires User-Agent header
        config.default_headers.insert(
            "User-Agent".to_string(),
            "NicheFinder/0.1.0".to_string(),
        );

        // GitHub API v3 accepts this header
        config.default_headers.insert(
            "Accept".to_string(),
            "application/vnd.github.v3+json".to_string(),
        );

        let connector = RestApiConnector::with_config(config)
            .await
            .map_err(|e| Error::Udm(udm_core::UdmError::Generic(e.to_string())))?;

        Ok(Self { connector })
    }

    /// Fetch repository information by owner and repo name
    pub async fn fetch_repository(&self, owner: &str, repo: &str) -> Result<GitHubRepository> {
        let path = format!("/repos/{}/{}", owner, repo);
        let response = self.connector.get(&path, None)
            .await
            .map_err(|e| Error::Udm(udm_core::UdmError::Generic(e.to_string())))?;

        let repository: GitHubRepository = serde_json::from_value(response)
            .map_err(|e| Error::Serialization(e))?;

        Ok(repository)
    }

    /// Fetch issues for a repository (includes PRs by default)
    pub async fn fetch_issues(&self, owner: &str, repo: &str, state: &str) -> Result<Vec<GitHubIssue>> {
        let path = format!("/repos/{}/{}/issues?state={}&per_page=100", owner, repo, state);
        let response = self.connector.get(&path, None)
            .await
            .map_err(|e| Error::Udm(udm_core::UdmError::Generic(e.to_string())))?;

        let issues: Vec<GitHubIssue> = serde_json::from_value(response)
            .map_err(|e| Error::Serialization(e))?;

        Ok(issues)
    }

    /// Search for repositories matching a query
    pub async fn search_repositories(&self, query: &str) -> Result<GitHubSearchResponse> {
        let encoded_query = urlencoding::encode(query);
        let path = format!("/search/repositories?q={}&per_page=100", encoded_query);
        let response = self.connector.get(&path, None)
            .await
            .map_err(|e| Error::Udm(udm_core::UdmError::Generic(e.to_string())))?;

        let search_result: GitHubSearchResponse = serde_json::from_value(response)
            .map_err(|e| Error::Serialization(e))?;

        Ok(search_result)
    }
}

#[async_trait]
impl DataCollector for GitHubCollector {
    async fn collect(&self) -> Result<Vec<CollectedData>> {
        // Search for Home Assistant integration repositories
        let query = "home-assistant topic:home-assistant language:python";
        let search_result = self.search_repositories(query).await?;

        let collected_data = search_result.items
            .into_iter()
            .map(|repo| CollectedData {
                source: "github".to_string(),
                data_type: "repository".to_string(),
                raw_data: serde_json::to_value(&repo).unwrap_or_default(),
                collected_at: chrono::Utc::now(),
            })
            .collect();

        Ok(collected_data)
    }

    fn source_name(&self) -> &str {
        "github"
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

