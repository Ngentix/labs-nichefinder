use crate::{Error, Result};
use std::collections::HashMap;
use udm_connector_generator::*;
use serde_json::json;

/// Generate HACS connector configuration
pub async fn generate_hacs_connector() -> Result<GenerationResult> {
    let config = GeneratorConfig {
        udm_discovery_url: "http://localhost:3001/api/v1".to_string(),
        peg_connector_service_url: "http://localhost:9004/api/v1".to_string(),
        timeout_seconds: 60,
        max_concurrent_generations: 5,
        auto_deploy: true, // Deploy to running PEG-Connector-Service
        output_dir: "./generated_connectors".to_string(),
    };
    
    let generator = ConnectorGeneratorService::new(config)
        .await
        .map_err(|e| Error::Udm(udm_core::UdmError::Generic(e.to_string())))?;
    
    let request = GenerateConnectorRequest {
        target_system: TargetSystem {
            system_id: "hacs".to_string(),
            system_name: "Home Assistant Community Store".to_string(),
            base_url: "https://data-v2.hacs.xyz".to_string(),
            system_type: SystemType::RestApi {
                api_version: Some("v2".to_string()),
                openapi_url: None,
            },
            auth_config: None, // HACS doesn't require auth
            metadata: {
                let mut meta = HashMap::new();
                meta.insert("category".to_string(), json!("home-automation"));
                meta.insert("vendor".to_string(), json!("HACS"));
                meta.insert("description".to_string(), json!("Home Assistant Community Store integration data"));
                meta
            },
        },
        options: GenerationOptions {
            include_schema: true,
            include_relationships: true,
            include_constraints: true,
            sample_size: Some(100),
            generate_tests: true,
            auto_deploy: false,
            output_format: ConfigFormat::Yaml,
        },
        tenant_id: None,
    };
    
    let result = generator.generate_connector(request)
        .await
        .map_err(|e| Error::Udm(udm_core::UdmError::Generic(e.to_string())))?;
    
    Ok(result)
}

/// Generate GitHub connector configuration
pub async fn generate_github_connector(token: Option<String>) -> Result<GenerationResult> {
    let config = GeneratorConfig {
        udm_discovery_url: "http://localhost:3001/api/v1".to_string(),
        peg_connector_service_url: "http://localhost:9004/api/v1".to_string(),
        timeout_seconds: 60,
        max_concurrent_generations: 5,
        auto_deploy: true,
        output_dir: "./generated_connectors".to_string(),
    };

    let generator = ConnectorGeneratorService::new(config)
        .await
        .map_err(|e| Error::Udm(udm_core::UdmError::Generic(e.to_string())))?;

    let mut credentials = HashMap::new();
    if let Some(token) = token {
        credentials.insert("access_token".to_string(), json!(token));
    }
    
    let request = GenerateConnectorRequest {
        target_system: TargetSystem {
            system_id: "github".to_string(),
            system_name: "GitHub API".to_string(),
            base_url: "https://api.github.com".to_string(),
            system_type: SystemType::RestApi {
                api_version: Some("v3".to_string()),
                openapi_url: Some("https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json".to_string()),
            },
            auth_config: Some(AuthConfig {
                auth_type: AuthType::BearerToken,
                credentials,
            }),
            metadata: {
                let mut meta = HashMap::new();
                meta.insert("category".to_string(), json!("developer-tools"));
                meta.insert("vendor".to_string(), json!("GitHub"));
                meta.insert("description".to_string(), json!("GitHub REST API for repository and issue data"));
                meta
            },
        },
        options: GenerationOptions {
            include_schema: true,
            include_relationships: true,
            include_constraints: true,
            sample_size: Some(100),
            generate_tests: true,
            auto_deploy: false,
            output_format: ConfigFormat::Yaml,
        },
        tenant_id: None,
    };
    
    let result = generator.generate_connector(request)
        .await
        .map_err(|e| Error::Udm(udm_core::UdmError::Generic(e.to_string())))?;
    
    Ok(result)
}

/// Generate Reddit connector configuration
pub async fn generate_reddit_connector(client_id: Option<String>, client_secret: Option<String>) -> Result<GenerationResult> {
    let config = GeneratorConfig {
        udm_discovery_url: "http://localhost:3001/api/v1".to_string(),
        peg_connector_service_url: "http://localhost:9004/api/v1".to_string(),
        timeout_seconds: 60,
        max_concurrent_generations: 5,
        auto_deploy: true,
        output_dir: "./generated_connectors".to_string(),
    };
    
    let generator = ConnectorGeneratorService::new(config)
        .await
        .map_err(|e| Error::Udm(udm_core::UdmError::Generic(e.to_string())))?;
    
    let mut credentials = HashMap::new();
    if let (Some(client_id), Some(client_secret)) = (client_id, client_secret) {
        credentials.insert("client_id".to_string(), json!(client_id));
        credentials.insert("client_secret".to_string(), json!(client_secret));
    }
    
    let request = GenerateConnectorRequest {
        target_system: TargetSystem {
            system_id: "reddit".to_string(),
            system_name: "Reddit API".to_string(),
            base_url: "https://oauth.reddit.com".to_string(),
            system_type: SystemType::RestApi {
                api_version: None,
                openapi_url: None,
            },
            auth_config: Some(AuthConfig {
                auth_type: AuthType::OAuth2,
                credentials,
            }),
            metadata: {
                let mut meta = HashMap::new();
                meta.insert("category".to_string(), json!("social-media"));
                meta.insert("vendor".to_string(), json!("Reddit"));
                meta.insert("description".to_string(), json!("Reddit API for community discussions"));
                meta
            },
        },
        options: GenerationOptions::default(),
        tenant_id: None,
    };
    
    let result = generator.generate_connector(request)
        .await
        .map_err(|e| Error::Udm(udm_core::UdmError::Generic(e.to_string())))?;
    
    Ok(result)
}

