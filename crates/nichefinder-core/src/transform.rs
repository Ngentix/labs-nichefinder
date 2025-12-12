//! Data transformation module for converting raw API responses into normalized structures

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use anyhow::{Context, Result};

/// Raw HACS integration data (as returned from API)
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct HacsIntegration {
    pub description: Option<String>,
    pub domain: String,
    pub full_name: String,
    pub stargazers_count: Option<u32>,
    pub open_issues: Option<u32>,
    pub last_updated: Option<String>,
    pub manifest_name: Option<String>,
    pub topics: Option<Vec<String>>,
}

/// Raw GitHub repository data
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct GitHubRepo {
    pub name: String,
    pub full_name: String,
    pub description: Option<String>,
    pub stargazers_count: u32,
    pub forks_count: u32,
    pub open_issues_count: u32,
    pub topics: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
    pub html_url: String,
}

/// Raw GitHub search response
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct GitHubSearchResponse {
    pub total_count: u32,
    pub incomplete_results: bool,
    pub items: Vec<GitHubRepo>,
}

/// Raw YouTube video data
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct YouTubeVideo {
    pub id: YouTubeVideoId,
    pub snippet: YouTubeSnippet,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct YouTubeVideoId {
    #[serde(rename = "videoId")]
    pub video_id: Option<String>,
    #[serde(rename = "channelId")]
    pub channel_id: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct YouTubeSnippet {
    pub title: String,
    #[serde(rename = "channelTitle")]
    pub channel_title: String,
    #[serde(rename = "publishedAt")]
    pub published_at: String,
    pub description: String,
}

/// Raw YouTube search response
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct YouTubeSearchResponse {
    pub items: Vec<YouTubeVideo>,
}

/// Normalized integration data combining multiple sources
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NormalizedIntegration {
    /// Integration name (from HACS or GitHub)
    pub name: String,
    
    /// Domain (from HACS)
    pub domain: Option<String>,
    
    /// Description
    pub description: Option<String>,
    
    /// GitHub repository URL
    pub github_url: Option<String>,
    
    /// GitHub stars
    pub stars: u32,
    
    /// GitHub forks
    pub forks: u32,
    
    /// Open issues
    pub open_issues: u32,
    
    /// Topics/tags
    pub topics: Vec<String>,
    
    /// Last updated timestamp
    pub last_updated: Option<DateTime<Utc>>,
    
    /// Whether it's available in HACS
    pub in_hacs: bool,
    
    /// YouTube mentions count
    pub youtube_mentions: u32,
    
    /// Source data
    pub sources: IntegrationSources,
}

/// Source data references
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrationSources {
    pub hacs_id: Option<String>,
    pub github_full_name: Option<String>,
    pub youtube_video_ids: Vec<String>,
}

/// Load and parse HACS integrations from JSON file
pub fn load_hacs_data(path: &str) -> Result<HashMap<String, HacsIntegration>> {
    let content = std::fs::read_to_string(path)
        .context("Failed to read HACS data file")?;
    
    let data: HashMap<String, HacsIntegration> = serde_json::from_str(&content)
        .context("Failed to parse HACS JSON")?;
    
    Ok(data)
}

/// Load and parse GitHub repositories from JSON file
pub fn load_github_data(path: &str) -> Result<Vec<GitHubRepo>> {
    let content = std::fs::read_to_string(path)
        .context("Failed to read GitHub data file")?;
    
    let response: GitHubSearchResponse = serde_json::from_str(&content)
        .context("Failed to parse GitHub JSON")?;
    
    Ok(response.items)
}

/// Load and parse YouTube videos from JSON file
pub fn load_youtube_data(path: &str) -> Result<Vec<YouTubeVideo>> {
    let content = std::fs::read_to_string(path)
        .context("Failed to read YouTube data file")?;

    let response: YouTubeSearchResponse = serde_json::from_str(&content)
        .context("Failed to parse YouTube JSON")?;

    Ok(response.items)
}

/// Normalize and combine data from all sources
pub fn normalize_integrations(
    hacs_data: HashMap<String, HacsIntegration>,
    github_data: Vec<GitHubRepo>,
    youtube_data: Vec<YouTubeVideo>,
) -> Result<Vec<NormalizedIntegration>> {
    let mut integrations = Vec::new();

    // Create a map of GitHub repos by full_name for quick lookup
    let github_map: HashMap<String, GitHubRepo> = github_data
        .into_iter()
        .map(|repo| (repo.full_name.clone(), repo))
        .collect();

    // Process HACS integrations
    for (hacs_id, hacs_integration) in hacs_data {
        let github_repo = github_map.get(&hacs_integration.full_name);

        let normalized = NormalizedIntegration {
            name: hacs_integration.manifest_name
                .clone()
                .unwrap_or_else(|| hacs_integration.domain.clone()),
            domain: Some(hacs_integration.domain.clone()),
            description: hacs_integration.description.clone()
                .or_else(|| github_repo.and_then(|r| r.description.clone())),
            github_url: Some(format!("https://github.com/{}", hacs_integration.full_name)),
            stars: github_repo.map(|r| r.stargazers_count)
                .or(hacs_integration.stargazers_count)
                .unwrap_or(0),
            forks: github_repo.map(|r| r.forks_count).unwrap_or(0),
            open_issues: github_repo.map(|r| r.open_issues_count)
                .or(hacs_integration.open_issues)
                .unwrap_or(0),
            topics: hacs_integration.topics.clone()
                .or_else(|| github_repo.map(|r| r.topics.clone()))
                .unwrap_or_default(),
            last_updated: parse_datetime(&hacs_integration.last_updated),
            in_hacs: true,
            youtube_mentions: count_youtube_mentions(&hacs_integration.domain, &youtube_data),
            sources: IntegrationSources {
                hacs_id: Some(hacs_id),
                github_full_name: Some(hacs_integration.full_name.clone()),
                youtube_video_ids: find_youtube_videos(&hacs_integration.domain, &youtube_data),
            },
        };

        integrations.push(normalized);
    }

    Ok(integrations)
}

/// Parse datetime string to DateTime<Utc>
fn parse_datetime(datetime_str: &Option<String>) -> Option<DateTime<Utc>> {
    datetime_str.as_ref().and_then(|s| {
        DateTime::parse_from_rfc3339(s)
            .ok()
            .map(|dt| dt.with_timezone(&Utc))
    })
}

/// Count YouTube mentions for a given integration domain
fn count_youtube_mentions(domain: &str, youtube_data: &[YouTubeVideo]) -> u32 {
    youtube_data.iter()
        .filter(|video| {
            // Only count videos (not channels)
            if video.id.video_id.is_none() {
                return false;
            }

            let title_lower = video.snippet.title.to_lowercase();
            let desc_lower = video.snippet.description.to_lowercase();
            let domain_lower = domain.to_lowercase();

            title_lower.contains(&domain_lower) || desc_lower.contains(&domain_lower)
        })
        .count() as u32
}

/// Find YouTube video IDs that mention a given integration domain
fn find_youtube_videos(domain: &str, youtube_data: &[YouTubeVideo]) -> Vec<String> {
    youtube_data.iter()
        .filter_map(|video| {
            // Only process videos (not channels)
            video.id.video_id.as_ref()?;

            let title_lower = video.snippet.title.to_lowercase();
            let desc_lower = video.snippet.description.to_lowercase();
            let domain_lower = domain.to_lowercase();

            if title_lower.contains(&domain_lower) || desc_lower.contains(&domain_lower) {
                video.id.video_id.clone()
            } else {
                None
            }
        })
        .collect()
}

