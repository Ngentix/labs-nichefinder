//! REST API routes

use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::sync::Arc;

/// Application state
#[derive(Clone)]
pub struct AppState {
    pub db_pool: SqlitePool,
}

/// Create the API router
pub fn create_router(db_pool: SqlitePool) -> Router {
    let state = Arc::new(AppState { db_pool });

    Router::new()
        .route("/health", get(health_check))
        .route("/api/opportunities", get(get_opportunities))
        .route("/api/analyze", post(trigger_analysis))
        .with_state(state)
}

/// Health check endpoint
async fn health_check() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "version": env!("CARGO_PKG_VERSION")
    }))
}

/// Query parameters for opportunities endpoint
#[derive(Debug, Deserialize)]
struct OpportunitiesQuery {
    #[serde(default = "default_limit")]
    limit: i64,
}

fn default_limit() -> i64 {
    20
}

/// Get top opportunities
async fn get_opportunities(
    State(state): State<Arc<AppState>>,
    Query(params): Query<OpportunitiesQuery>,
) -> Result<Json<OpportunitiesResponse>, AppError> {
    let opportunities = crate::db::get_top_opportunities(&state.db_pool, params.limit).await?;

    Ok(Json(OpportunitiesResponse { opportunities }))
}

/// Response for opportunities endpoint
#[derive(Debug, Serialize)]
struct OpportunitiesResponse {
    opportunities: Vec<nichefinder_core::NicheOpportunity>,
}

/// Trigger a manual analysis
async fn trigger_analysis(
    State(state): State<Arc<AppState>>,
) -> Result<Json<AnalysisResponse>, AppError> {
    // TODO: Implement actual analysis trigger
    // For now, return a placeholder response
    
    Ok(Json(AnalysisResponse {
        status: "queued".to_string(),
        message: "Analysis job queued (placeholder)".to_string(),
    }))
}

/// Response for analysis trigger
#[derive(Debug, Serialize)]
struct AnalysisResponse {
    status: String,
    message: String,
}

/// API error type
#[derive(Debug)]
struct AppError(anyhow::Error);

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({
                "error": self.0.to_string()
            })),
        )
            .into_response()
    }
}

impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}

