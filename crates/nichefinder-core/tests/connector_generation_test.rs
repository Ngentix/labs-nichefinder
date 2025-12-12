use nichefinder_core::connector_gen::*;

#[tokio::test]
#[ignore] // Ignore by default since it requires network access
async fn test_generate_hacs_connector() {
    let result = generate_hacs_connector().await;
    
    match result {
        Ok(generation_result) => {
            println!("✅ HACS Connector Generated Successfully!");
            println!("System ID: {}", generation_result.connector_config.system_id);
            println!("System Name: {}", generation_result.connector_config.system_name);
            println!("Category: {}", generation_result.connector_config.category);
            println!("Vendor: {}", generation_result.connector_config.vendor);
            println!("Description: {}", generation_result.connector_config.description);
            println!("API Type: {}", generation_result.connector_config.api_type);
            println!("Base URL: {:?}", generation_result.connector_config.base_url);
            println!("Auth Methods: {:?}", generation_result.connector_config.auth_methods);
            println!("Action Mappings: {} actions", generation_result.connector_config.action_mappings.len());
            
            println!("\nSchema Analysis:");
            println!("  Entities: {}", generation_result.schema_analysis.entities.len());
            println!("  Endpoints: {}", generation_result.schema_analysis.endpoints.len());
            println!("  Confidence: {:.2}%", generation_result.schema_analysis.confidence_score * 100.0);
            
            println!("\nGeneration Metadata:");
            println!("  Generation ID: {}", generation_result.metadata.generation_id);
            println!("  Processing Time: {}ms", generation_result.metadata.processing_time_ms);
            println!("  Generator Version: {}", generation_result.metadata.generator_version);

            if let Some(deployment) = generation_result.deployment_result {
                println!("\nDeployment:");
                println!("  Success: {}", deployment.success);
                println!("  Connector ID: {}", deployment.connector_id);
                println!("  Deployment URL: {}", deployment.deployment_url);
                if let Some(error) = deployment.error {
                    println!("  Error: {}", error);
                }
            } else {
                println!("\nDeployment: Skipped (auto_deploy=false)");
            }
            
            // Verify the connector config has expected properties
            assert_eq!(generation_result.connector_config.system_id, "hacs");
            assert!(!generation_result.connector_config.action_mappings.is_empty(), "Expected action mappings");
        }
        Err(e) => {
            println!("❌ Failed to generate HACS connector: {:?}", e);
            panic!("Connector generation failed: {:?}", e);
        }
    }
}

#[tokio::test]
#[ignore] // Ignore by default
async fn test_generate_github_connector() {
    let result = generate_github_connector(None).await;
    
    match result {
        Ok(generation_result) => {
            println!("✅ GitHub Connector Generated Successfully!");
            println!("System ID: {}", generation_result.connector_config.system_id);
            println!("Action Mappings: {} actions", generation_result.connector_config.action_mappings.len());
            println!("Entities: {}", generation_result.schema_analysis.entities.len());
            println!("Endpoints: {}", generation_result.schema_analysis.endpoints.len());
            
            assert_eq!(generation_result.connector_config.system_id, "github");
        }
        Err(e) => {
            println!("❌ Failed to generate GitHub connector: {:?}", e);
            panic!("Connector generation failed: {:?}", e);
        }
    }
}

#[tokio::test]
#[ignore] // Ignore by default
async fn test_generate_reddit_connector() {
    let result = generate_reddit_connector(None, None).await;
    
    match result {
        Ok(generation_result) => {
            println!("✅ Reddit Connector Generated Successfully!");
            println!("System ID: {}", generation_result.connector_config.system_id);
            println!("Action Mappings: {} actions", generation_result.connector_config.action_mappings.len());
            println!("Entities: {}", generation_result.schema_analysis.entities.len());
            println!("Endpoints: {}", generation_result.schema_analysis.endpoints.len());
            
            assert_eq!(generation_result.connector_config.system_id, "reddit");
        }
        Err(e) => {
            println!("❌ Failed to generate Reddit connector: {:?}", e);
            panic!("Connector generation failed: {:?}", e);
        }
    }
}

