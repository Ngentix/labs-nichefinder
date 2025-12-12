//! NicheFinder Server
//!
//! REST API server with scheduling for automated niche analysis

mod api;
mod config;
mod db;
mod scheduler;

use anyhow::Result;
use clap::Parser;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[derive(Parser, Debug)]
#[command(name = "nichefinder-server")]
#[command(about = "NicheFinder API server with scheduling", long_about = None)]
struct Args {
    /// Server host
    #[arg(long, env = "HOST", default_value = "0.0.0.0")]
    host: String,

    /// Server port
    #[arg(long, env = "PORT", default_value = "3000")]
    port: u16,

    /// Database URL
    #[arg(long, env = "DATABASE_URL", default_value = "sqlite://nichefinder.db")]
    database_url: String,

    /// Enable scheduler
    #[arg(long, env = "ENABLE_SCHEDULER", default_value = "true")]
    enable_scheduler: bool,

    /// Log level
    #[arg(long, env = "LOG_LEVEL", default_value = "info")]
    log_level: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    let args = Args::parse();

    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| args.log_level.clone().into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Starting NicheFinder Server v{}", env!("CARGO_PKG_VERSION"));

    // Initialize database
    let db_pool = db::init_db(&args.database_url).await?;
    tracing::info!("Database initialized");

    // Start scheduler if enabled
    let scheduler_handle = if args.enable_scheduler {
        let handle = scheduler::start_scheduler(db_pool.clone()).await?;
        tracing::info!("Scheduler started");
        Some(handle)
    } else {
        tracing::info!("Scheduler disabled");
        None
    };

    // Build API router
    let app = api::create_router(db_pool.clone());

    // Start server
    let addr = format!("{}:{}", args.host, args.port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    tracing::info!("Server listening on {}", addr);

    axum::serve(listener, app).await?;

    // Cleanup
    if let Some(handle) = scheduler_handle {
        handle.shutdown().await?;
    }

    Ok(())
}

