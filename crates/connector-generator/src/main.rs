//! Connector Generator CLI
//!
//! Command-line tool to generate and deploy connectors for NicheFinder.

use anyhow::Result;
use clap::Parser;
use connector_generator::{NicheFinderConnectorConfig, NicheFinderConnectorGenerator};
use tracing::info;

#[derive(Parser, Debug)]
#[command(name = "connector-generator")]
#[command(about = "Generate and deploy connectors for NicheFinder", long_about = None)]
struct Args {
    /// PEG-Connector-Service URL
    #[arg(
        long,
        default_value = "http://localhost:8080/api/v1",
        env = "PEG_CONNECTOR_SERVICE_URL"
    )]
    peg_service_url: String,

    /// Output directory for generated connector configs
    #[arg(long, default_value = "./connectors")]
    output_dir: String,

    /// Yelp API key
    #[arg(long, env = "YELP_API_KEY")]
    yelp_api_key: Option<String>,

    /// Google Maps API key
    #[arg(long, env = "GOOGLE_MAPS_API_KEY")]
    google_maps_api_key: Option<String>,

    /// Generate only Yelp connector
    #[arg(long)]
    yelp_only: bool,

    /// Generate only Google Maps connector
    #[arg(long)]
    google_maps_only: bool,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    let args = Args::parse();

    info!("🚀 NicheFinder Connector Generator");
    info!("===================================");
    info!("");
    info!("Configuration:");
    info!("  - PEG Service: {}", args.peg_service_url);
    info!("  - Output Dir: {}", args.output_dir);
    info!(
        "  - Yelp API Key: {}",
        if args.yelp_api_key.is_some() {
            "✓ Provided"
        } else {
            "✗ Not provided (will use placeholder)"
        }
    );
    info!(
        "  - Google Maps API Key: {}",
        if args.google_maps_api_key.is_some() {
            "✓ Provided"
        } else {
            "✗ Not provided (will use placeholder)"
        }
    );
    info!("");

    // Create connector generator config
    let config = NicheFinderConnectorConfig {
        peg_connector_service_url: args.peg_service_url,
        output_dir: args.output_dir,
        yelp_api_key: args.yelp_api_key,
        google_maps_api_key: args.google_maps_api_key,
    };

    // Create generator
    let generator = NicheFinderConnectorGenerator::new(config).await?;

    // Generate connectors based on flags
    if args.yelp_only {
        generator.generate_yelp_connector().await?;
    } else if args.google_maps_only {
        generator.generate_google_maps_connector().await?;
    } else {
        generator.generate_all_connectors().await?;
    }

    info!("");
    info!("🎉 Done!");
    info!("");
    info!("Next steps:");
    info!("  1. Verify connectors are deployed to PEG-Connector-Service");
    info!("  2. Test connectors with sample API calls");
    info!("  3. Create PEG workflows that use these connectors");

    Ok(())
}

