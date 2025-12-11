//! Connector Generator for NicheFinder
//!
//! This module provides functionality to auto-generate connectors for:
//! - Yelp Fusion API v3
//! - Google Maps Places API
//!
//! The connectors are deployed to a local PEG-Connector-Service instance.

use anyhow::Result;
use serde_json::json;
use std::collections::HashMap;
use tracing::{info, warn};
use udm_connector_generator::{
    AuthConfig, AuthType, ConfigFormat, ConnectorGeneratorService, GenerateConnectorRequest,
    GenerationOptions, GeneratorConfig, SystemType, TargetSystem,
};

/// Configuration for connector generation
pub struct NicheFinderConnectorConfig {
    /// URL of the PEG-Connector-Service
    pub peg_connector_service_url: String,
    /// Directory to output generated connector configs
    pub output_dir: String,
    /// Yelp API key
    pub yelp_api_key: Option<String>,
    /// Google Maps API key
    pub google_maps_api_key: Option<String>,
}

impl Default for NicheFinderConnectorConfig {
    fn default() -> Self {
        Self {
            peg_connector_service_url: "http://localhost:8080/api/v1".to_string(),
            output_dir: "./connectors".to_string(),
            yelp_api_key: None,
            google_maps_api_key: None,
        }
    }
}

/// Main service for generating NicheFinder connectors
pub struct NicheFinderConnectorGenerator {
    generator_service: ConnectorGeneratorService,
    config: NicheFinderConnectorConfig,
}

impl NicheFinderConnectorGenerator {
    /// Create a new connector generator
    pub async fn new(config: NicheFinderConnectorConfig) -> Result<Self> {
        let generator_config = GeneratorConfig {
            peg_connector_service_url: config.peg_connector_service_url.clone(),
            auto_deploy: true,
            output_dir: config.output_dir.clone(),
            ..Default::default()
        };

        let generator_service = ConnectorGeneratorService::new(generator_config).await?;

        Ok(Self {
            generator_service,
            config,
        })
    }

    /// Generate Yelp Fusion API connector
    pub async fn generate_yelp_connector(&self) -> Result<()> {
        info!("🔧 Generating Yelp Fusion API connector...");

        let api_key = self
            .config
            .yelp_api_key
            .clone()
            .unwrap_or_else(|| "YOUR_YELP_API_KEY".to_string());

        let mut credentials = HashMap::new();
        credentials.insert("token".to_string(), json!(api_key));

        let request = GenerateConnectorRequest {
            target_system: TargetSystem {
                system_id: "yelp".to_string(),
                system_name: "Yelp Fusion API".to_string(),
                base_url: "https://api.yelp.com/v3".to_string(),
                system_type: SystemType::RestApi {
                    api_version: Some("v3".to_string()),
                    openapi_url: None,
                },
                auth_config: Some(AuthConfig {
                    auth_type: AuthType::BearerToken,
                    credentials,
                }),
                metadata: {
                    let mut meta = HashMap::new();
                    meta.insert("category".to_string(), json!("Business Directory"));
                    meta.insert("vendor".to_string(), json!("Yelp"));
                    meta.insert(
                        "description".to_string(),
                        json!("Local business search and reviews"),
                    );
                    meta
                },
            },
            options: GenerationOptions {
                include_schema: true,
                include_relationships: true,
                auto_deploy: true,
                output_format: ConfigFormat::Yaml,
                ..Default::default()
            },
            tenant_id: None,
        };

        match self.generator_service.generate_connector(request).await {
            Ok(result) => {
                info!("✅ Yelp connector generated successfully!");
                info!(
                    "   - Connector ID: {}",
                    result.connector_config.system_id
                );
                info!(
                    "   - Entities discovered: {}",
                    result.schema_analysis.entities.len()
                );
                info!(
                    "   - Endpoints discovered: {}",
                    result.schema_analysis.endpoints.len()
                );
                info!(
                    "   - Confidence score: {:.1}%",
                    result.schema_analysis.confidence_score * 100.0
                );

                if let Some(deployment) = result.deployment_result {
                    info!("   - Deployment URL: {}", deployment.deployment_url);
                }
                Ok(())
            }
            Err(e) => {
                warn!("❌ Failed to generate Yelp connector: {}", e);
                Err(e)
            }
        }
    }

    /// Generate Google Maps Places API connector
    pub async fn generate_google_maps_connector(&self) -> Result<()> {
        info!("🔧 Generating Google Maps Places API connector...");

        let api_key = self
            .config
            .google_maps_api_key
            .clone()
            .unwrap_or_else(|| "YOUR_GOOGLE_MAPS_API_KEY".to_string());

        // Google Maps uses API key as query parameter
        let mut credentials = HashMap::new();
        credentials.insert("key".to_string(), json!(api_key));

        let request = GenerateConnectorRequest {
            target_system: TargetSystem {
                system_id: "google_maps".to_string(),
                system_name: "Google Maps Places API".to_string(),
                base_url: "https://maps.googleapis.com/maps/api/place".to_string(),
                system_type: SystemType::RestApi {
                    api_version: Some("v1".to_string()),
                    openapi_url: None,
                },
                auth_config: Some(AuthConfig {
                    auth_type: AuthType::ApiKey,
                    credentials,
                }),
                metadata: {
                    let mut meta = HashMap::new();
                    meta.insert("category".to_string(), json!("Maps & Location"));
                    meta.insert("vendor".to_string(), json!("Google"));
                    meta.insert(
                        "description".to_string(),
                        json!("Places search and location data"),
                    );
                    meta
                },
            },
            options: GenerationOptions {
                include_schema: true,
                include_relationships: true,
                auto_deploy: true,
                output_format: ConfigFormat::Yaml,
                ..Default::default()
            },
            tenant_id: None,
        };

        match self.generator_service.generate_connector(request).await {
            Ok(result) => {
                info!("✅ Google Maps connector generated successfully!");
                info!(
                    "   - Connector ID: {}",
                    result.connector_config.system_id
                );
                info!(
                    "   - Entities discovered: {}",
                    result.schema_analysis.entities.len()
                );
                info!(
                    "   - Endpoints discovered: {}",
                    result.schema_analysis.endpoints.len()
                );
                info!(
                    "   - Confidence score: {:.1}%",
                    result.schema_analysis.confidence_score * 100.0
                );

                if let Some(deployment) = result.deployment_result {
                    info!("   - Deployment URL: {}", deployment.deployment_url);
                }
                Ok(())
            }
            Err(e) => {
                warn!("❌ Failed to generate Google Maps connector: {}", e);
                Err(e)
            }
        }
    }

    /// Generate all NicheFinder connectors
    pub async fn generate_all_connectors(&self) -> Result<()> {
        info!("🚀 Generating all NicheFinder connectors...");
        info!("");

        // Generate Yelp connector
        if let Err(e) = self.generate_yelp_connector().await {
            warn!("Yelp connector generation failed: {}", e);
        }
        info!("");

        // Generate Google Maps connector
        if let Err(e) = self.generate_google_maps_connector().await {
            warn!("Google Maps connector generation failed: {}", e);
        }
        info!("");

        info!("✅ Connector generation complete!");
        Ok(())
    }
}

