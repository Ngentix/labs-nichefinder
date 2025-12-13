//! REST API routes

use axum::{
    extract::{Path, Query, State},
    http::{Method, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

/// Application state
#[derive(Clone)]
pub struct AppState {
    pub db_pool: SqlitePool,
}

/// Create the API router
pub fn create_router(db_pool: SqlitePool) -> Router {
    let state = Arc::new(AppState { db_pool });

    // Configure CORS for local development
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any);

    Router::new()
        .route("/health", get(health_check))
        .route("/api/opportunities", get(get_opportunities))
        .route("/api/analyze", post(trigger_analysis))
        // System endpoints
        .route("/api/system/status", get(get_system_status))
        .route("/api/system/stats", get(get_system_stats))
        // Workflow endpoints
        .route("/api/workflows", get(get_workflows))
        .route("/api/workflows/{id}/execute", post(execute_workflow))
        // Execution endpoints
        .route("/api/executions", get(get_executions))
        .route("/api/executions/{id}", get(get_execution))
        .route("/api/executions/{id}/trace", get(get_execution_trace))
        // Artifact endpoints
        .route("/api/artifacts", get(get_artifacts))
        .route("/api/artifacts/{id}", get(get_artifact))
        // Connector endpoints
        .route("/api/connectors", get(get_connectors))
        .layer(cors)
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

// ============================================================================
// System Endpoints
// ============================================================================

/// Get system status
async fn get_system_status(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<SystemStatusResponse>, AppError> {
    // TODO: Implement actual service health checks
    Ok(Json(SystemStatusResponse {
        services: vec![
            ServiceStatus {
                name: "nichefinder-server".to_string(),
                port: 3001,
                status: "healthy".to_string(),
                uptime: Some(3600),
            },
            ServiceStatus {
                name: "udm-core".to_string(),
                port: 0,
                status: "healthy".to_string(),
                uptime: None,
            },
            ServiceStatus {
                name: "peg-executor".to_string(),
                port: 0,
                status: "healthy".to_string(),
                uptime: None,
            },
        ],
    }))
}

#[derive(Debug, Serialize)]
struct SystemStatusResponse {
    services: Vec<ServiceStatus>,
}

#[derive(Debug, Serialize)]
struct ServiceStatus {
    name: String,
    port: u16,
    status: String,
    uptime: Option<u64>,
}

/// Get system statistics
async fn get_system_stats(
    State(state): State<Arc<AppState>>,
) -> Result<Json<SystemStatsResponse>, AppError> {
    // Get total opportunities count
    let total_opportunities = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM niche_opportunities"
    )
    .fetch_one(&state.db_pool)
    .await
    .unwrap_or(0);

    Ok(Json(SystemStatsResponse {
        total_workflows: 3,
        total_artifacts: 15,
        total_opportunities: total_opportunities as u64,
        last_execution: Some("2024-12-12T10:30:00Z".to_string()),
    }))
}

#[derive(Debug, Serialize)]
struct SystemStatsResponse {
    total_workflows: u64,
    total_artifacts: u64,
    total_opportunities: u64,
    last_execution: Option<String>,
}

// ============================================================================
// Workflow Endpoints
// ============================================================================

/// Get all workflows
async fn get_workflows(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<WorkflowsResponse>, AppError> {
    // TODO: Load workflows from UDM
    Ok(Json(WorkflowsResponse {
        workflows: vec![
            WorkflowDefinition {
                id: "homeassistant-analysis".to_string(),
                name: "Home Assistant Analysis".to_string(),
                description: Some("Analyze Home Assistant integration opportunities".to_string()),
                steps: vec![
                    WorkflowStep {
                        id: "fetch-hacs".to_string(),
                        name: "Fetch HACS Data".to_string(),
                        connector: "hacs-connector".to_string(),
                        status: None,
                    },
                    WorkflowStep {
                        id: "fetch-github".to_string(),
                        name: "Fetch GitHub Data".to_string(),
                        connector: "github-connector".to_string(),
                        status: None,
                    },
                    WorkflowStep {
                        id: "fetch-youtube".to_string(),
                        name: "Fetch YouTube Data".to_string(),
                        connector: "youtube-connector".to_string(),
                        status: None,
                    },
                ],
            },
        ],
    }))
}

#[derive(Debug, Serialize)]
struct WorkflowsResponse {
    workflows: Vec<WorkflowDefinition>,
}

#[derive(Debug, Serialize)]
struct WorkflowDefinition {
    id: String,
    name: String,
    description: Option<String>,
    steps: Vec<WorkflowStep>,
}

#[derive(Debug, Serialize)]
struct WorkflowStep {
    id: String,
    name: String,
    connector: String,
    status: Option<String>,
}

/// Execute a workflow
async fn execute_workflow(
    State(_state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<ExecutionResponse>, AppError> {
    // TODO: Implement actual workflow execution
    Ok(Json(ExecutionResponse {
        execution_id: format!("exec-{}", uuid::Uuid::new_v4()),
        workflow_id: id,
        status: "queued".to_string(),
        message: "Workflow execution queued".to_string(),
    }))
}

#[derive(Debug, Serialize)]
struct ExecutionResponse {
    execution_id: String,
    workflow_id: String,
    status: String,
    message: String,
}

// ============================================================================
// Execution Endpoints
// ============================================================================

/// Get all executions
async fn get_executions(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<ExecutionsResponse>, AppError> {
    // TODO: Load executions from database
    Ok(Json(ExecutionsResponse {
        executions: vec![],
    }))
}

#[derive(Debug, Serialize)]
struct ExecutionsResponse {
    executions: Vec<WorkflowExecution>,
}

#[derive(Debug, Serialize)]
struct WorkflowExecution {
    id: String,
    workflow_id: String,
    status: String,
    started_at: String,
    completed_at: Option<String>,
    duration: Option<u64>,
    artifacts_produced: u64,
}

/// Get a specific execution
async fn get_execution(
    State(_state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<ExecutionDetailResponse>, AppError> {
    // TODO: Load execution details from database
    Ok(Json(ExecutionDetailResponse {
        execution: WorkflowExecution {
            id: id.clone(),
            workflow_id: "homeassistant-analysis".to_string(),
            status: "completed".to_string(),
            started_at: "2024-12-12T10:30:00Z".to_string(),
            completed_at: Some("2024-12-12T10:35:00Z".to_string()),
            duration: Some(300),
            artifacts_produced: 3,
        },
        logs: vec![
            ExecutionLog {
                timestamp: "2024-12-12T10:30:00Z".to_string(),
                level: "info".to_string(),
                message: "Starting workflow execution".to_string(),
            },
            ExecutionLog {
                timestamp: "2024-12-12T10:35:00Z".to_string(),
                level: "info".to_string(),
                message: "Workflow completed successfully".to_string(),
            },
        ],
    }))
}

#[derive(Debug, Serialize)]
struct ExecutionDetailResponse {
    execution: WorkflowExecution,
    logs: Vec<ExecutionLog>,
}

#[derive(Debug, Serialize)]
struct ExecutionLog {
    timestamp: String,
    level: String,
    message: String,
}

/// Get execution trace (proxy to peg-engine)
async fn get_execution_trace(
    State(_state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Get peg-engine URL from environment or use default
    let peg_engine_url = std::env::var("PEG_ENGINE_URL")
        .unwrap_or_else(|_| "http://localhost:3007".to_string());

    let url = format!("{}/api/v1/executions/{}/trace", peg_engine_url, id);

    // Make request to peg-engine
    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| AppError(anyhow::anyhow!("Failed to fetch trace from peg-engine: {}", e)))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(AppError(anyhow::anyhow!("peg-engine returned error {}: {}", status, error_text)));
    }

    let trace_data = response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| AppError(anyhow::anyhow!("Failed to parse trace response: {}", e)))?;

    Ok(Json(trace_data))
}

// ============================================================================
// Artifact Endpoints
// ============================================================================

/// Get all artifacts
async fn get_artifacts(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<ArtifactsResponse>, AppError> {
    // TODO: Load artifacts from filesystem/database
    Ok(Json(ArtifactsResponse {
        artifacts: vec![
            ArtifactMetadata {
                id: "artifact-1".to_string(),
                filename: "hacs_integrations.json".to_string(),
                size: 1024000,
                source: "hacs-connector".to_string(),
                execution_id: "exec-123".to_string(),
                created_at: "2024-12-12T10:30:00Z".to_string(),
                mime_type: "application/json".to_string(),
            },
        ],
    }))
}

#[derive(Debug, Serialize)]
struct ArtifactsResponse {
    artifacts: Vec<ArtifactMetadata>,
}

#[derive(Debug, Serialize)]
struct ArtifactMetadata {
    id: String,
    filename: String,
    size: u64,
    source: String,
    execution_id: String,
    created_at: String,
    mime_type: String,
}

/// Get a specific artifact
async fn get_artifact(
    State(_state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<ArtifactDetailResponse>, AppError> {
    // TODO: Load artifact content from filesystem
    Ok(Json(ArtifactDetailResponse {
        metadata: ArtifactMetadata {
            id: id.clone(),
            filename: "hacs_integrations.json".to_string(),
            size: 1024000,
            source: "hacs-connector".to_string(),
            execution_id: "exec-123".to_string(),
            created_at: "2024-12-12T10:30:00Z".to_string(),
            mime_type: "application/json".to_string(),
        },
        content: serde_json::json!({
            "integrations": []
        }),
    }))
}

#[derive(Debug, Serialize)]
struct ArtifactDetailResponse {
    metadata: ArtifactMetadata,
    content: serde_json::Value,
}

// ============================================================================
// Connector Endpoints
// ============================================================================

/// Get all connectors
async fn get_connectors(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<ConnectorsResponse>, AppError> {
    // TODO: Load connectors from UDM
    Ok(Json(ConnectorsResponse {
        connectors: vec![
            ConnectorInfo {
                id: "hacs-connector".to_string(),
                name: "HACS Connector".to_string(),
                version: "1.0.0".to_string(),
                description: Some("Fetches Home Assistant Community Store data".to_string()),
                output_schema: None,
            },
            ConnectorInfo {
                id: "github-connector".to_string(),
                name: "GitHub Connector".to_string(),
                version: "1.0.0".to_string(),
                description: Some("Fetches GitHub repository data".to_string()),
                output_schema: None,
            },
            ConnectorInfo {
                id: "youtube-connector".to_string(),
                name: "YouTube Connector".to_string(),
                version: "1.0.0".to_string(),
                description: Some("Fetches YouTube video data".to_string()),
                output_schema: None,
            },
        ],
    }))
}

#[derive(Debug, Serialize)]
struct ConnectorsResponse {
    connectors: Vec<ConnectorInfo>,
}

#[derive(Debug, Serialize)]
struct ConnectorInfo {
    id: String,
    name: String,
    version: String,
    description: Option<String>,
    output_schema: Option<serde_json::Value>,
}

