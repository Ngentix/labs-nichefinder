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
use std::time::Instant;
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

/// Request for analysis trigger
#[derive(Debug, Deserialize)]
struct AnalysisRequest {
    execution_id: String,
}

/// Trigger analysis from workflow execution artifacts
async fn trigger_analysis(
    State(state): State<Arc<AppState>>,
    Json(request): Json<AnalysisRequest>,
) -> Result<Json<AnalysisResponse>, AppError> {
    tracing::info!("Starting analysis for execution: {}", request.execution_id);

    // Fetch artifacts from peg-engine
    let peg_engine_url = std::env::var("PEG_ENGINE_URL")
        .unwrap_or_else(|_| "http://localhost:3007".to_string());

    let client = reqwest::Client::new();
    let artifacts_url = format!(
        "{}/api/v1/executions/{}/artifacts",
        peg_engine_url, request.execution_id
    );

    // Log and execute HTTP call to fetch artifacts
    let start = Instant::now();
    let response = client
        .get(&artifacts_url)
        .send()
        .await
        .map_err(|e| anyhow::anyhow!("Failed to fetch artifacts: {}", e))?;

    let status = response.status().as_u16();
    let duration_ms = start.elapsed().as_millis();

    tracing::info!(
        service_call = true,
        service_from = "nichefinder-server",
        service_to = "peg-engine",
        method = "GET",
        url = %artifacts_url,
        status = status,
        duration_ms = duration_ms as u64,
        "Fetching artifacts from peg-engine"
    );

    let artifacts: Vec<ArtifactMetadata> = response
        .json()
        .await
        .map_err(|e| anyhow::anyhow!("Failed to parse artifacts response: {}", e))?;

    tracing::info!("Found {} artifacts", artifacts.len());

    // Find the three required artifacts
    let hacs_artifact = artifacts
        .iter()
        .find(|a| a.step_id == "fetch_hacs_integrations")
        .ok_or_else(|| anyhow::anyhow!("HACS artifact not found"))?;

    let github_artifact = artifacts
        .iter()
        .find(|a| a.step_id == "search_github_repos")
        .ok_or_else(|| anyhow::anyhow!("GitHub artifact not found"))?;

    let youtube_artifact = artifacts
        .iter()
        .find(|a| a.step_id == "search_youtube_videos")
        .ok_or_else(|| anyhow::anyhow!("YouTube artifact not found"))?;

    // Download artifacts to temp files
    let temp_dir = std::env::temp_dir();
    let hacs_path = temp_dir.join(format!("hacs_{}.json", request.execution_id));
    let github_path = temp_dir.join(format!("github_{}.json", request.execution_id));
    let youtube_path = temp_dir.join(format!("youtube_{}.json", request.execution_id));

    download_artifact(&client, &peg_engine_url, &hacs_artifact.id, &hacs_path).await?;
    download_artifact(&client, &peg_engine_url, &github_artifact.id, &github_path).await?;
    download_artifact(&client, &peg_engine_url, &youtube_artifact.id, &youtube_path).await?;

    tracing::info!("Downloaded all artifacts to temp directory");

    // Run analysis
    let analyzer = nichefinder_core::IntegrationAnalyzer::new();
    let result = analyzer
        .analyze_from_files(
            hacs_path.to_str().unwrap(),
            github_path.to_str().unwrap(),
            youtube_path.to_str().unwrap(),
        )
        .map_err(|e| anyhow::anyhow!("Analysis failed: {}", e))?;

    tracing::info!(
        "Analysis complete: {} opportunities found from {} candidates",
        result.opportunities.len(),
        result.metadata.total_candidates
    );

    // Save opportunities to database
    for opportunity in &result.opportunities {
        crate::db::save_opportunity(&state.db_pool, opportunity)
            .await
            .map_err(|e| anyhow::anyhow!("Failed to save opportunity: {}", e))?;
    }

    // Clean up temp files
    let _ = tokio::fs::remove_file(&hacs_path).await;
    let _ = tokio::fs::remove_file(&github_path).await;
    let _ = tokio::fs::remove_file(&youtube_path).await;

    Ok(Json(AnalysisResponse {
        status: "completed".to_string(),
        message: format!(
            "Analysis completed: {} opportunities found from {} candidates",
            result.opportunities.len(),
            result.metadata.total_candidates
        ),
        opportunities_found: result.opportunities.len(),
        execution_id: request.execution_id,
    }))
}

/// Helper function to download an artifact
async fn download_artifact(
    client: &reqwest::Client,
    peg_engine_url: &str,
    artifact_id: &str,
    dest_path: &std::path::Path,
) -> Result<(), anyhow::Error> {
    let download_url = format!(
        "{}/api/v1/artifacts/{}/download",
        peg_engine_url, artifact_id
    );

    // Log and execute HTTP call to download artifact
    let start = Instant::now();
    let response = client
        .get(&download_url)
        .send()
        .await
        .map_err(|e| anyhow::anyhow!("Failed to download artifact {}: {}", artifact_id, e))?;

    let status = response.status().as_u16();
    let duration_ms = start.elapsed().as_millis();

    tracing::info!(
        service_call = true,
        service_from = "nichefinder-server",
        service_to = "peg-engine",
        method = "GET",
        url = %download_url,
        status = status,
        duration_ms = duration_ms as u64,
        artifact_id = %artifact_id,
        "Downloading artifact from peg-engine"
    );

    let bytes = response
        .bytes()
        .await
        .map_err(|e| anyhow::anyhow!("Failed to read artifact bytes: {}", e))?;

    tokio::fs::write(dest_path, bytes)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to write artifact to file: {}", e))?;

    Ok(())
}

/// Artifact metadata from peg-engine
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ArtifactMetadata {
    id: String,
    step_id: String,
    name: String,
}

/// Response for analysis trigger
#[derive(Debug, Serialize)]
struct AnalysisResponse {
    status: String,
    message: String,
    opportunities_found: usize,
    execution_id: String,
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
) -> Result<Json<serde_json::Value>, AppError> {
    // Proxy to peg-engine to get executions
    let peg_engine_url = std::env::var("PEG_ENGINE_URL")
        .unwrap_or_else(|_| "http://localhost:3007".to_string());

    let url = format!("{}/api/v1/executions", peg_engine_url);

    // Log and execute HTTP call
    let client = reqwest::Client::new();
    let start = Instant::now();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| AppError(anyhow::anyhow!("Failed to fetch executions from peg-engine: {}", e)))?;

    let status = response.status().as_u16();
    let duration_ms = start.elapsed().as_millis();

    tracing::info!(
        service_call = true,
        service_from = "nichefinder-server",
        service_to = "peg-engine",
        method = "GET",
        url = %url,
        status = status,
        duration_ms = duration_ms as u64,
        "Fetching executions from peg-engine"
    );

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(AppError(anyhow::anyhow!("peg-engine returned error {}: {}", status, error_text)));
    }

    let executions_data = response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| AppError(anyhow::anyhow!("Failed to parse executions response: {}", e)))?;

    Ok(Json(executions_data))
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

    // Log and execute HTTP call
    let client = reqwest::Client::new();
    let start = Instant::now();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| AppError(anyhow::anyhow!("Failed to fetch trace from peg-engine: {}", e)))?;

    let status = response.status().as_u16();
    let duration_ms = start.elapsed().as_millis();

    tracing::info!(
        service_call = true,
        service_from = "nichefinder-server",
        service_to = "peg-engine",
        method = "GET",
        url = %url,
        status = status,
        duration_ms = duration_ms as u64,
        execution_id = %id,
        "Fetching execution trace from peg-engine"
    );

    if !response.status().is_success() {
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
            ArtifactResponse {
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
    artifacts: Vec<ArtifactResponse>,
}

#[derive(Debug, Serialize)]
struct ArtifactResponse {
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
        metadata: ArtifactResponse {
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
    metadata: ArtifactResponse,
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

