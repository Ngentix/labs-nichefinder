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
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};

/// Service call record for tracking HTTP calls
#[derive(Debug, Clone, Serialize)]
pub struct ServiceCall {
    pub timestamp: String,
    pub execution_id: Option<String>,
    pub service_from: String,
    pub service_to: String,
    pub method: String,
    pub url: String,
    pub status: u16,
    pub duration_ms: u64,
    pub artifact_id: Option<String>,
}

/// Application state
#[derive(Clone)]
pub struct AppState {
    pub db_pool: SqlitePool,
    pub service_calls: Arc<RwLock<Vec<ServiceCall>>>,
}

/// Create the API router
pub fn create_router(db_pool: SqlitePool) -> Router {
    let state = Arc::new(AppState {
        db_pool,
        service_calls: Arc::new(RwLock::new(Vec::new())),
    });

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
        .route("/api/executions/{id}/service-calls", get(get_service_calls))
        // Artifact endpoints
        .route("/api/artifacts", get(get_artifacts))
        .route("/api/artifacts/{id}", get(get_artifact))
        // Connector endpoints
        .route("/api/connectors", get(get_connectors))
        .layer(cors)
        .with_state(state)
}

/// Helper function to record a service call
fn record_service_call(
    state: &Arc<AppState>,
    execution_id: Option<String>,
    service_from: &str,
    service_to: &str,
    method: &str,
    url: &str,
    status: u16,
    duration_ms: u64,
    artifact_id: Option<String>,
) {
    let call = ServiceCall {
        timestamp: chrono::Utc::now().to_rfc3339(),
        execution_id,
        service_from: service_from.to_string(),
        service_to: service_to.to_string(),
        method: method.to_string(),
        url: url.to_string(),
        status,
        duration_ms,
        artifact_id,
    };

    if let Ok(mut calls) = state.service_calls.write() {
        // Keep only the last 1000 calls to prevent unbounded growth
        if calls.len() >= 1000 {
            calls.remove(0);
        }
        calls.push(call);
    }
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
    let duration_ms = start.elapsed().as_millis() as u64;

    tracing::info!(
        service_call = true,
        service_from = "nichefinder-server",
        service_to = "peg-engine",
        method = "GET",
        url = %artifacts_url,
        status = status,
        duration_ms = duration_ms,
        "Fetching artifacts from peg-engine"
    );

    // Record service call
    record_service_call(
        &state,
        Some(request.execution_id.clone()),
        "nichefinder-server",
        "peg-engine",
        "GET",
        &artifacts_url,
        status,
        duration_ms,
        None,
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

    download_artifact(&state, &client, &peg_engine_url, &request.execution_id, &hacs_artifact.id, &hacs_path).await?;
    download_artifact(&state, &client, &peg_engine_url, &request.execution_id, &github_artifact.id, &github_path).await?;
    download_artifact(&state, &client, &peg_engine_url, &request.execution_id, &youtube_artifact.id, &youtube_path).await?;

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
    state: &Arc<AppState>,
    client: &reqwest::Client,
    peg_engine_url: &str,
    execution_id: &str,
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
    let duration_ms = start.elapsed().as_millis() as u64;

    tracing::info!(
        service_call = true,
        service_from = "nichefinder-server",
        service_to = "peg-engine",
        method = "GET",
        url = %download_url,
        status = status,
        duration_ms = duration_ms,
        artifact_id = %artifact_id,
        "Downloading artifact from peg-engine"
    );

    // Record service call
    record_service_call(
        state,
        Some(execution_id.to_string()),
        "nichefinder-server",
        "peg-engine",
        "GET",
        &download_url,
        status,
        duration_ms,
        Some(artifact_id.to_string()),
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
    // Perform health checks for all services in parallel
    let http_services = vec![
        check_service_health("nichefinder-server", 3001, "http://localhost:3001/health"),
        check_service_health("peg-engine", 3007, "http://localhost:3007/health"),
        check_service_health("credential-vault", 3005, "http://localhost:3005/health"),
        check_service_health("PEG-Connector-Service", 9004, "http://localhost:9004/health"),
        check_service_health("ChromaDB", 8000, "http://localhost:8000/api/v1/heartbeat"),
    ];

    let postgres_services = vec![
        check_postgres_health("PostgreSQL (peg-engine)", 5436),
        check_postgres_health("PostgreSQL (main)", 5433),
    ];

    let redis_services = vec![
        check_redis_health("Redis (peg-engine)", 5379),
        check_redis_health("Redis (main)", 6380),
    ];

    let (http_results, postgres_results, redis_results) = tokio::join!(
        futures::future::join_all(http_services),
        futures::future::join_all(postgres_services),
        futures::future::join_all(redis_services),
    );

    let mut all_services = Vec::new();
    all_services.extend(http_results);
    all_services.extend(postgres_results);
    all_services.extend(redis_results);

    Ok(Json(SystemStatusResponse {
        services: all_services,
    }))
}

/// Check health of an HTTP service
async fn check_service_health(name: &str, port: u16, url: &str) -> ServiceStatus {
    let start = Instant::now();
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .unwrap();

    match client.get(url).send().await {
        Ok(response) => {
            let duration_ms = start.elapsed().as_millis() as u64;
            let is_healthy = response.status().is_success();
            ServiceStatus {
                name: name.to_string(),
                port,
                status: if is_healthy { "healthy".to_string() } else { "unhealthy".to_string() },
                response_time_ms: Some(duration_ms),
                last_check: Some(chrono::Utc::now().to_rfc3339()),
                error: if !is_healthy { Some(format!("HTTP {}", response.status())) } else { None },
            }
        }
        Err(e) => {
            ServiceStatus {
                name: name.to_string(),
                port,
                status: "down".to_string(),
                response_time_ms: None,
                last_check: Some(chrono::Utc::now().to_rfc3339()),
                error: Some(e.to_string()),
            }
        }
    }
}

/// Check PostgreSQL health by attempting a connection
async fn check_postgres_health(name: &str, port: u16) -> ServiceStatus {
    let start = Instant::now();
    let connection_string = format!("postgresql://postgres:postgres@localhost:{}/postgres", port);

    match sqlx::postgres::PgPoolOptions::new()
        .max_connections(1)
        .acquire_timeout(std::time::Duration::from_secs(5))
        .connect(&connection_string)
        .await
    {
        Ok(pool) => {
            // Try a simple query
            match sqlx::query("SELECT 1").fetch_one(&pool).await {
                Ok(_) => {
                    let duration_ms = start.elapsed().as_millis() as u64;
                    ServiceStatus {
                        name: name.to_string(),
                        port,
                        status: "healthy".to_string(),
                        response_time_ms: Some(duration_ms),
                        last_check: Some(chrono::Utc::now().to_rfc3339()),
                        error: None,
                    }
                }
                Err(e) => {
                    ServiceStatus {
                        name: name.to_string(),
                        port,
                        status: "unhealthy".to_string(),
                        response_time_ms: None,
                        last_check: Some(chrono::Utc::now().to_rfc3339()),
                        error: Some(e.to_string()),
                    }
                }
            }
        }
        Err(e) => {
            ServiceStatus {
                name: name.to_string(),
                port,
                status: "down".to_string(),
                response_time_ms: None,
                last_check: Some(chrono::Utc::now().to_rfc3339()),
                error: Some(e.to_string()),
            }
        }
    }
}

/// Check Redis health by attempting a connection
async fn check_redis_health(name: &str, port: u16) -> ServiceStatus {
    let start = Instant::now();

    // For Redis, we'll use a simple TCP connection check
    // In a production system, you'd use a Redis client library
    match tokio::net::TcpStream::connect(format!("localhost:{}", port)).await {
        Ok(_) => {
            let duration_ms = start.elapsed().as_millis() as u64;
            ServiceStatus {
                name: name.to_string(),
                port,
                status: "healthy".to_string(),
                response_time_ms: Some(duration_ms),
                last_check: Some(chrono::Utc::now().to_rfc3339()),
                error: None,
            }
        }
        Err(e) => {
            ServiceStatus {
                name: name.to_string(),
                port,
                status: "down".to_string(),
                response_time_ms: None,
                last_check: Some(chrono::Utc::now().to_rfc3339()),
                error: Some(e.to_string()),
            }
        }
    }
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
    response_time_ms: Option<u64>,
    last_check: Option<String>,
    error: Option<String>,
}

/// Get system statistics
async fn get_system_stats(
    State(state): State<Arc<AppState>>,
) -> Result<Json<SystemStatsResponse>, AppError> {
    // Get total opportunities count from local database
    let total_opportunities = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM niche_opportunities"
    )
    .fetch_one(&state.db_pool)
    .await
    .unwrap_or(0);

    // Get execution statistics from peg-engine
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .unwrap();

    let (total_executions, total_workflows, total_artifacts, last_execution) =
        match client.get("http://localhost:3007/api/v1/executions").send().await {
            Ok(response) => {
                if let Ok(data) = response.json::<serde_json::Value>().await {
                    let empty_vec = vec![];
                    let executions = data["executions"].as_array().unwrap_or(&empty_vec);
                    let total_executions = executions.len() as u64;

                    // Get last execution timestamp
                    let last_execution = executions
                        .first()
                        .and_then(|e| e["startTime"].as_str())
                        .map(|s| s.to_string());

                    // Count unique workflows
                    let mut workflow_ids = std::collections::HashSet::new();
                    for exec in executions {
                        if let Some(workflow_id) = exec["workflowId"].as_str() {
                            workflow_ids.insert(workflow_id);
                        }
                    }
                    let total_workflows = workflow_ids.len() as u64;

                    // Count total artifacts across all executions
                    let mut total_artifacts = 0u64;
                    for exec in executions {
                        if let Some(exec_id) = exec["id"].as_str() {
                            if let Ok(artifacts_response) = client
                                .get(format!("http://localhost:3007/api/v1/executions/{}/artifacts", exec_id))
                                .send()
                                .await
                            {
                                if let Ok(artifacts_data) = artifacts_response.json::<serde_json::Value>().await {
                                    if let Some(artifacts) = artifacts_data.as_array() {
                                        total_artifacts += artifacts.len() as u64;
                                    }
                                }
                            }
                        }
                    }

                    (total_executions, total_workflows, total_artifacts, last_execution)
                } else {
                    (0, 0, 0, None)
                }
            }
            Err(_) => (0, 0, 0, None),
        };

    Ok(Json(SystemStatsResponse {
        total_workflows,
        total_executions,
        total_artifacts,
        total_opportunities: total_opportunities as u64,
        last_execution,
    }))
}

#[derive(Debug, Serialize)]
struct SystemStatsResponse {
    total_workflows: u64,
    total_executions: u64,
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

/// Get aggregated service calls for an execution
async fn get_service_calls(
    State(state): State<Arc<AppState>>,
    Path(execution_id): Path<String>,
) -> Result<Json<ServiceCallsResponse>, AppError> {
    // Get all service calls for this execution
    let calls = state
        .service_calls
        .read()
        .map_err(|e| AppError(anyhow::anyhow!("Failed to read service calls: {}", e)))?
        .iter()
        .filter(|call| {
            call.execution_id.as_ref().map(|id| id == &execution_id).unwrap_or(false)
        })
        .cloned()
        .collect::<Vec<_>>();

    // Group calls by operation type
    let mut aggregated = HashMap::new();

    for call in calls {
        // Determine operation type based on URL
        let operation = if call.url.contains("/artifacts/") && call.url.contains("/download") {
            "artifact_download"
        } else if call.url.contains("/artifacts") {
            "artifact_fetch"
        } else {
            "other"
        };

        let key = format!("{}_{}", operation, call.method);
        aggregated
            .entry(key.clone())
            .or_insert_with(|| AggregatedServiceCall {
                operation: operation.to_string(),
                service_from: call.service_from.clone(),
                service_to: call.service_to.clone(),
                method: call.method.clone(),
                call_count: 0,
                success_count: 0,
                failure_count: 0,
                avg_duration: 0.0,
                min_duration: u64::MAX,
                max_duration: 0,
                timestamp: call.timestamp.clone(),
                details: Vec::new(),
            });

        if let Some(agg) = aggregated.get_mut(&key) {
            agg.call_count += 1;
            if call.status >= 200 && call.status < 300 {
                agg.success_count += 1;
            } else {
                agg.failure_count += 1;
            }
            agg.min_duration = agg.min_duration.min(call.duration_ms);
            agg.max_duration = agg.max_duration.max(call.duration_ms);
            agg.details.push(call);
        }
    }

    // Calculate average durations
    for agg in aggregated.values_mut() {
        let total_duration: u64 = agg.details.iter().map(|c| c.duration_ms).sum();
        agg.avg_duration = if agg.call_count > 0 {
            total_duration as f64 / agg.call_count as f64
        } else {
            0.0
        };
    }

    let aggregated_calls: Vec<AggregatedServiceCall> = aggregated.into_values().collect();

    Ok(Json(ServiceCallsResponse {
        execution_id,
        aggregated_calls,
    }))
}

#[derive(Debug, Serialize)]
struct ServiceCallsResponse {
    execution_id: String,
    aggregated_calls: Vec<AggregatedServiceCall>,
}

#[derive(Debug, Serialize)]
struct AggregatedServiceCall {
    operation: String,
    service_from: String,
    service_to: String,
    method: String,
    call_count: usize,
    success_count: usize,
    failure_count: usize,
    avg_duration: f64,
    min_duration: u64,
    max_duration: u64,
    timestamp: String,
    details: Vec<ServiceCall>,
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

