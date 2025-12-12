use nichefinder_core::collectors::{DataCollector, RedditCollector};
use std::env;

#[tokio::test]
async fn test_reddit_collector_creation() {
    // Test creating collector without credentials (unauthenticated)
    let collector = RedditCollector::new(None, None).await;
    assert!(collector.is_ok(), "Failed to create Reddit collector without credentials");
}

#[tokio::test]
#[ignore] // Ignore by default since it requires Reddit credentials
async fn test_reddit_search() {
    let client_id = env::var("REDDIT_CLIENT_ID").ok();
    let client_secret = env::var("REDDIT_CLIENT_SECRET").ok();
    
    let collector = RedditCollector::new(client_id, client_secret)
        .await
        .expect("Failed to create collector");
    
    // Search for Home Assistant integration discussions
    let posts = collector.search("homeassistant integration", 10).await;
    assert!(posts.is_ok(), "Failed to search posts: {:?}", posts.err());
    
    let posts = posts.unwrap();
    println!("Found {} posts", posts.len());
    
    // Print first 5 posts
    for post in posts.iter().take(5) {
        println!("  - r/{}: {} (score: {}, comments: {})", 
            post.subreddit,
            post.title,
            post.score,
            post.num_comments
        );
    }
    
    assert!(!posts.is_empty(), "Expected at least some posts");
}

#[tokio::test]
#[ignore] // Ignore by default since it requires Reddit credentials
async fn test_reddit_fetch_subreddit_posts() {
    let client_id = env::var("REDDIT_CLIENT_ID").ok();
    let client_secret = env::var("REDDIT_CLIENT_SECRET").ok();
    
    let collector = RedditCollector::new(client_id, client_secret)
        .await
        .expect("Failed to create collector");
    
    // Fetch hot posts from r/homeassistant
    let posts = collector.fetch_subreddit_posts("homeassistant", "hot", 10).await;
    assert!(posts.is_ok(), "Failed to fetch subreddit posts: {:?}", posts.err());
    
    let posts = posts.unwrap();
    println!("Found {} hot posts from r/homeassistant", posts.len());
    
    // Print first 5 posts
    for post in posts.iter().take(5) {
        println!("  - {}: {} (score: {}, comments: {})", 
            post.author,
            post.title,
            post.score,
            post.num_comments
        );
    }
    
    assert!(!posts.is_empty(), "Expected at least some posts");
}

#[tokio::test]
#[ignore] // Ignore by default since it requires Reddit credentials
async fn test_reddit_collector_trait() {
    let client_id = env::var("REDDIT_CLIENT_ID").ok();
    let client_secret = env::var("REDDIT_CLIENT_SECRET").ok();
    
    let collector = RedditCollector::new(client_id, client_secret)
        .await
        .expect("Failed to create collector");
    
    // Test the DataCollector trait implementation
    let collected_data = collector.collect().await;
    assert!(collected_data.is_ok(), "Failed to collect data: {:?}", collected_data.err());
    
    let collected_data = collected_data.unwrap();
    println!("Collected {} data items from {}", collected_data.len(), collector.source_name());
    
    assert!(!collected_data.is_empty(), "Expected at least some collected data");
    assert_eq!(collector.source_name(), "reddit");
    
    // Verify data structure
    for item in collected_data.iter().take(3) {
        assert_eq!(item.source, "reddit");
        assert_eq!(item.data_type, "post");
        println!("  - Collected post data at {}", item.collected_at);
    }
}

