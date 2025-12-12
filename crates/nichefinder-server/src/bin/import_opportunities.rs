//! Import opportunities from JSON file into the database

use nichefinder_core::types::AnalysisResult;
use sqlx::SqlitePool;
use std::path::PathBuf;
use clap::Parser;

#[derive(Parser, Debug)]
#[command(name = "import-opportunities")]
#[command(about = "Import opportunities from JSON into database", long_about = None)]
struct Args {
    /// Path to JSON file containing analysis results
    #[arg(long, default_value = "data/opportunities.json")]
    input: PathBuf,
    
    /// Database URL
    #[arg(long, env = "DATABASE_URL", default_value = "sqlite://nichefinder.db")]
    database_url: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive(tracing::Level::INFO.into())
        )
        .init();
    
    let args = Args::parse();
    
    tracing::info!("Reading opportunities from: {}", args.input.display());
    
    // Read JSON file
    let json_content = std::fs::read_to_string(&args.input)?;
    let analysis_result: AnalysisResult = serde_json::from_str(&json_content)?;
    
    tracing::info!("Found {} opportunities to import", analysis_result.opportunities.len());
    
    // Connect to database
    tracing::info!("Connecting to database: {}", args.database_url);
    let pool = SqlitePool::connect(&args.database_url).await?;
    
    // Clear existing opportunities
    tracing::info!("Clearing existing opportunities...");
    sqlx::query("DELETE FROM opportunities")
        .execute(&pool)
        .await?;
    
    // Insert opportunities
    tracing::info!("Inserting {} opportunities...", analysis_result.opportunities.len());
    
    for opportunity in &analysis_result.opportunities {
        let scoring_details_json = serde_json::to_string(&opportunity.scoring_details)?;
        let data_sources_json = serde_json::to_string(&opportunity.data_sources)?;
        let metadata_json = serde_json::to_string(&opportunity.metadata)?;
        
        sqlx::query(
            r#"
            INSERT INTO opportunities (id, name, category, score, scoring_details, data_sources, discovered_at, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#
        )
        .bind(opportunity.id.to_string())
        .bind(&opportunity.name)
        .bind(&opportunity.category)
        .bind(opportunity.score)
        .bind(scoring_details_json)
        .bind(data_sources_json)
        .bind(opportunity.discovered_at.to_rfc3339())
        .bind(metadata_json)
        .execute(&pool)
        .await?;
    }
    
    tracing::info!("✅ Successfully imported {} opportunities!", analysis_result.opportunities.len());
    
    // Verify
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM opportunities")
        .fetch_one(&pool)
        .await?;
    
    tracing::info!("Database now contains {} opportunities", count);
    
    Ok(())
}

