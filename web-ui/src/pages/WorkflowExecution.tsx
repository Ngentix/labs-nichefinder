import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

  const fetchExecution = async () => {
    try {
      if (id) {
        // Fetch specific execution by ID
        const data = await apiClient.getExecution(id);
        setExecution(data.execution);
      } else {
        // Fetch latest execution
        const data = await apiClient.getExecutions();
        const executions = data.executions || [];

        if (executions.length === 0) {
          setError('No executions found. Execute a workflow to see results.');
          setLoading(false);
          return;
        }

        // Sort by started_at descending to get the latest
        const sortedExecutions = executions.sort((a: any, b: any) =>
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
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

  useEffect(() => {
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

  if (error || !execution) {
    return (
      <div className="p-6">
        <ErrorMessage message={error || 'Execution not found'} />
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
          <StatusBadge status={execution.status} />
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
              {new Date(execution.started_at).toLocaleString()}
            </dd>
          </div>
          {execution.completed_at && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Completed At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(execution.completed_at).toLocaleString()}
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

