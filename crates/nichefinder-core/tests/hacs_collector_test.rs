//! Integration tests for HACS data collector

use nichefinder_core::collectors::{DataCollector, HacsCollector};

#[tokio::test]
async fn test_hacs_collector_creation() {
    let collector = HacsCollector::new().await;
    assert!(collector.is_ok(), "Failed to create HACS collector: {:?}", collector.err());
}

#[tokio::test]
async fn test_hacs_fetch_integrations() {
    let collector = HacsCollector::new().await.expect("Failed to create collector");
    
    let integrations = collector.fetch_integrations().await;
    assert!(integrations.is_ok(), "Failed to fetch integrations: {:?}", integrations.err());
    
    let integrations = integrations.unwrap();
    assert!(!integrations.is_empty(), "Expected at least some integrations");
    
    // Print first 5 integrations for debugging
    println!("Found {} integrations", integrations.len());
    for (id, integration) in integrations.iter().take(5) {
        println!("  - {}: {:?} (downloads: {:?}, stars: {:?})",
            id,
            integration.manifest_name,
            integration.downloads,
            integration.stargazers_count
        );
    }
}

#[tokio::test]
async fn test_hacs_collector_trait() {
    let collector = HacsCollector::new().await.expect("Failed to create collector");
    
    assert_eq!(collector.source_name(), "HACS");
    
    let collected_data = collector.collect().await;
    assert!(collected_data.is_ok(), "Failed to collect data: {:?}", collected_data.err());
    
    let collected_data = collected_data.unwrap();
    assert!(!collected_data.is_empty(), "Expected at least some collected data");
    
    // Verify data structure
    let first_item = &collected_data[0];
    assert_eq!(first_item.source, "hacs");
    assert_eq!(first_item.data_type, "integration");
    assert!(!first_item.raw_data.is_null());
}

