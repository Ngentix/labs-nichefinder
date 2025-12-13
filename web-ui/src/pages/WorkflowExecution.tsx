import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, XCircle, Play, RefreshCw } from 'lucide-react';
import { apiClient } from '../api/client';
import { ServiceCallTrace } from '../components/trace/ServiceCallTrace';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { StatusBadge } from '../components/shared/StatusBadge';

export function WorkflowExecution() {
  const { id } = useParams<{ id: string }>();
  const [execution, setExecution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [executing, setExecuting] = useState(false);

  const fetchWorkflows = async () => {
    try {
      const data: any = await apiClient.getWorkflows();
      setWorkflows(data.workflows || []);
      if (data.workflows && data.workflows.length > 0) {
        setSelectedWorkflow(data.workflows[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    }
  };

  const fetchExecution = async () => {
    try {
      if (id) {
        // Fetch specific execution by ID
        const data: any = await apiClient.getExecution(id);
        setExecution(data.execution);
      } else {
        // Fetch latest execution
        const data: any = await apiClient.getExecutions();
        const executions = data.executions || [];

        if (executions.length === 0) {
          setError(null); // Clear error to show the execute button
          setLoading(false);
          return;
        }

        // Sort by startTime descending to get the latest
        const sortedExecutions = executions.sort((a: any, b: any) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );

        setExecution(sortedExecutions[0]);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch execution:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch execution');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!selectedWorkflow) return;

    setExecuting(true);
    try {
      const response = await apiClient.executeWorkflow(selectedWorkflow);
      console.log('Workflow execution started:', response);

      // Wait a moment for the execution to be created, then refresh
      setTimeout(() => {
        fetchExecution();
        setExecuting(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to execute workflow:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute workflow');
      setExecuting(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    fetchExecution();
  }, [id]);

  // Poll for updates while execution is running
  useEffect(() => {
    if (!execution || execution.status === 'completed' || execution.status === 'failed') {
      return;
    }

    const interval = setInterval(() => {
      fetchExecution();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [execution?.status, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Show execute workflow UI if no executions found
  if (!execution && !error) {
    return (
      <div className="p-6 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Workflow Execution</h2>
          <p className="text-sm text-gray-500 mt-1">Execute a workflow to see results</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Execute Workflow</h3>
          <p className="text-sm text-gray-600 mb-6">
            Select a workflow and click "Execute" to start a new workflow execution.
            The execution will appear here once started.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="workflow-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Workflow
              </label>
              <select
                id="workflow-select"
                value={selectedWorkflow}
                onChange={(e) => setSelectedWorkflow(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={executing}
              >
                {workflows.map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </option>
                ))}
              </select>
              {selectedWorkflow && (
                <p className="mt-2 text-sm text-gray-500">
                  {workflows.find(w => w.id === selectedWorkflow)?.description || 'No description available'}
                </p>
              )}
            </div>

            <button
              onClick={handleExecuteWorkflow}
              disabled={!selectedWorkflow || executing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {executing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Execute Workflow
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="p-6">
        <ErrorMessage message="Execution not found" />
      </div>
    );
  }

  const isRunning = execution.status === 'running' || execution.status === 'pending';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Workflow Execution</h2>
            <p className="text-sm text-gray-500 mt-1">ID: {execution.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExecuteWorkflow}
              disabled={!selectedWorkflow || executing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
              title="Execute another workflow"
            >
              {executing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Execute Workflow
                </>
              )}
            </button>
            <StatusBadge status={execution.status} />
          </div>
        </div>
      </div>

      {/* Execution Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Execution Details</h3>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Workflow ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{execution.workflow_id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900">{execution.status}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Started At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(execution.startTime).toLocaleString()}
            </dd>
          </div>
          {execution.endTime && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Completed At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(execution.endTime).toLocaleString()}
              </dd>
            </div>
          )}
          {execution.duration && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-sm text-gray-900">{execution.duration}s</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Artifacts Produced</dt>
            <dd className="mt-1 text-sm text-gray-900">{execution.artifacts_produced}</dd>
          </div>
        </dl>
      </div>

      {/* Job Errors */}
      {execution.jobs && execution.jobs.some((job: any) => job.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Execution Errors</h3>
          </div>
          <div className="space-y-4">
            {execution.jobs
              .filter((job: any) => job.error)
              .map((job: any) => (
                <div key={job.id} className="bg-white border border-red-100 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-red-800">
                        Step: {job.stepId}
                      </p>
                      <p className="mt-1 text-sm text-red-700 font-mono break-all whitespace-pre-wrap">
                        {job.error}
                      </p>
                      {job.endTime && (
                        <p className="mt-2 text-xs text-red-500">
                          Failed at: {new Date(job.endTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Execution Logs */}
      {execution.logs && execution.logs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Execution Logs</h3>
          <div className="space-y-2">
            {execution.logs.map((log: any, index: number) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`font-semibold ${log.level === 'error' ? 'text-red-600' :
                  log.level === 'warn' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                  {log.level.toUpperCase()}
                </span>
                <span className="text-gray-700">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Call Trace */}
      {execution?.id && (
        <div className="bg-white rounded-lg shadow p-6">
          <ServiceCallTrace executionId={execution.id} isExecutionRunning={isRunning} />
        </div>
      )}
    </div>
  );
}

