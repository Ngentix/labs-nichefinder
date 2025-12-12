//! Database management

use anyhow::Result;
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use sqlx::Row;

/// Initialize database connection pool
pub async fn init_db(database_url: &str) -> Result<SqlitePool> {
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await?;

    // Run migrations
    run_migrations(&pool).await?;

    Ok(pool)
}

/// Run database migrations
async fn run_migrations(pool: &SqlitePool) -> Result<()> {
    // Create opportunities table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS opportunities (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            score REAL NOT NULL,
            scoring_details TEXT NOT NULL,
            data_sources TEXT NOT NULL,
            discovered_at TEXT NOT NULL,
            metadata TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create analysis_runs table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS analysis_runs (
            id TEXT PRIMARY KEY,
            analyzed_at TEXT NOT NULL,
            config TEXT NOT NULL,
            metadata TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create index on score for faster queries
    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_opportunities_score 
        ON opportunities(score DESC)
        "#,
    )
    .execute(pool)
    .await?;

    tracing::info!("Database migrations completed");
    Ok(())
}

/// Save an opportunity to the database
pub async fn save_opportunity(
    pool: &SqlitePool,
    opportunity: &nichefinder_core::NicheOpportunity,
) -> Result<()> {
    sqlx::query(
        r#"
        INSERT INTO opportunities (
            id, name, category, score, scoring_details, 
            data_sources, discovered_at, metadata
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            score = excluded.score,
            scoring_details = excluded.scoring_details,
            data_sources = excluded.data_sources,
            metadata = excluded.metadata
        "#,
    )
    .bind(opportunity.id.to_string())
    .bind(&opportunity.name)
    .bind(&opportunity.category)
    .bind(opportunity.score)
    .bind(serde_json::to_string(&opportunity.scoring_details)?)
    .bind(serde_json::to_string(&opportunity.data_sources)?)
    .bind(opportunity.discovered_at.to_rfc3339())
    .bind(serde_json::to_string(&opportunity.metadata)?)
    .execute(pool)
    .await?;

    Ok(())
}

/// Get top opportunities from the database
pub async fn get_top_opportunities(
    pool: &SqlitePool,
    limit: i64,
) -> Result<Vec<nichefinder_core::NicheOpportunity>> {
    let rows = sqlx::query(
        r#"
        SELECT id, name, category, score, scoring_details, 
               data_sources, discovered_at, metadata
        FROM opportunities
        ORDER BY score DESC
        LIMIT ?
        "#,
    )
    .bind(limit)
    .fetch_all(pool)
    .await?;

    let mut opportunities = Vec::new();
    for row in rows {
        let opportunity = nichefinder_core::NicheOpportunity {
            id: row.get::<String, _>("id").parse()?,
            name: row.get("name"),
            category: row.get("category"),
            score: row.get("score"),
            scoring_details: serde_json::from_str(&row.get::<String, _>("scoring_details"))?,
            data_sources: serde_json::from_str(&row.get::<String, _>("data_sources"))?,
            discovered_at: row.get::<String, _>("discovered_at").parse()?,
            metadata: serde_json::from_str(&row.get::<String, _>("metadata"))?,
        };
        opportunities.push(opportunity);
    }

    Ok(opportunities)
}

