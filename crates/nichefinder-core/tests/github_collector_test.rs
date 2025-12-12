use nichefinder_core::collectors::{DataCollector, GitHubCollector};
use std::env;

#[tokio::test]
async fn test_github_collector_creation() {
    // Test creating collector without token (unauthenticated)
    let collector = GitHubCollector::new(None).await;
    assert!(collector.is_ok(), "Failed to create GitHub collector without token");
}

#[tokio::test]
#[ignore] // Ignore by default since it requires a GitHub token
async fn test_github_fetch_repository() {
    let token = env::var("GITHUB_TOKEN").ok();
    let collector = GitHubCollector::new(token).await.expect("Failed to create collector");
    
    // Fetch the Home Assistant core repository
    let repo = collector.fetch_repository("home-assistant", "core").await;
    assert!(repo.is_ok(), "Failed to fetch repository: {:?}", repo.err());
    
    let repo = repo.unwrap();
    println!("Repository: {} ({})", repo.full_name, repo.description.unwrap_or_default());
    println!("  Stars: {}, Forks: {}, Open Issues: {}", 
        repo.stargazers_count, 
        repo.forks_count, 
        repo.open_issues_count
    );
    
    assert_eq!(repo.full_name, "home-assistant/core");
    assert!(repo.stargazers_count > 0, "Expected stars > 0");
}

#[tokio::test]
#[ignore] // Ignore by default since it requires a GitHub token
async fn test_github_search_repositories() {
    let token = env::var("GITHUB_TOKEN").ok();
    let collector = GitHubCollector::new(token).await.expect("Failed to create collector");
    
    // Search for Home Assistant integrations
    let search_result = collector.search_repositories("home-assistant topic:home-assistant").await;
    assert!(search_result.is_ok(), "Failed to search repositories: {:?}", search_result.err());
    
    let search_result = search_result.unwrap();
    println!("Found {} repositories (incomplete: {})", 
        search_result.total_count, 
        search_result.incomplete_results
    );
    
    // Print first 5 results
    for repo in search_result.items.iter().take(5) {
        println!("  - {}: {} (stars: {})", 
            repo.full_name, 
            repo.description.as_deref().unwrap_or("No description"),
            repo.stargazers_count
        );
    }
    
    assert!(search_result.total_count > 0, "Expected at least some results");
    assert!(!search_result.items.is_empty(), "Expected at least some items");
}

#[tokio::test]
#[ignore] // Ignore by default since it requires a GitHub token
async fn test_github_collector_trait() {
    let token = env::var("GITHUB_TOKEN").ok();
    let collector = GitHubCollector::new(token).await.expect("Failed to create collector");
    
    // Test the DataCollector trait implementation
    let collected_data = collector.collect().await;
    assert!(collected_data.is_ok(), "Failed to collect data: {:?}", collected_data.err());
    
    let collected_data = collected_data.unwrap();
    println!("Collected {} data items from {}", collected_data.len(), collector.source_name());
    
    assert!(!collected_data.is_empty(), "Expected at least some collected data");
    assert_eq!(collector.source_name(), "github");
    
    // Verify data structure
    for item in collected_data.iter().take(3) {
        assert_eq!(item.source, "github");
        assert_eq!(item.data_type, "repository");
        println!("  - Collected repository data at {}", item.collected_at);
    }
}

