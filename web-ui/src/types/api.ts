// API Response Types

export interface Opportunity {
  domain: string;
  score: number;
  demand_score: number;
  feasibility_score: number;
  competition_score: number;
  trend_score: number;
  github_stars?: number;
  github_issues?: number;
  github_url?: string;
  youtube_mentions: number;
  in_hacs: boolean;
  sources: string[];
}

export interface ServiceStatus {
  name: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'unknown';
  uptime?: number;
}

export interface SystemStats {
  total_workflows: number;
  total_artifacts: number;
  total_opportunities: number;
  last_execution?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  connector: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  duration?: number;
  artifacts_produced: number;
}

export interface ExecutionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface Artifact {
  id: string;
  filename: string;
  size: number;
  source: string;
  execution_id: string;
  created_at: string;
}

export interface ArtifactMetadata {
  id: string;
  filename: string;
  size: number;
  source: string;
  execution_id: string;
  created_at: string;
  mime_type: string;
}

export interface TransformationPreview {
  raw: any;
  normalized: any;
  analyzed: any;
  transformation_rules: string[];
}

export interface ConnectorInfo {
  id: string;
  name: string;
  version: string;
  description?: string;
  output_schema?: any;
}

export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

