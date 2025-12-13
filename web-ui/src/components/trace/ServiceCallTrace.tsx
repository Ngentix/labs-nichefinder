import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { ExecutionTrace, TraceEntry as TraceEntryType } from '../../types/api';
import { TraceEntry } from './TraceEntry';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Activity } from 'lucide-react';

interface ServiceCallTraceProps {
  executionId: string;
  isExecutionRunning: boolean;
}

export function ServiceCallTrace({ executionId, isExecutionRunning }: ServiceCallTraceProps) {
  const [trace, setTrace] = useState<ExecutionTrace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrace = async () => {
    try {
      const data = await apiClient.getExecutionTrace(executionId);
      setTrace(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch trace:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrace();
  }, [executionId]);

  // Poll for updates while execution is running
  useEffect(() => {
    if (!isExecutionRunning) return;

    const interval = setInterval(() => {
      fetchTrace();
    }, 500); // Poll every 500ms

    return () => clearInterval(interval);
  }, [isExecutionRunning, executionId]);

  // Group traces by step
  const groupedTraces = trace?.traces.reduce((acc, t) => {
    const key = t.stepId || 'unknown';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(t);
    return acc;
  }, {} as Record<string, TraceEntryType[]>) || {};

  if (loading && !trace) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !trace) {
    return <ErrorMessage message={error} />;
  }

  if (!trace || trace.traces.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="mx-auto mb-2" size={32} />
        <p>No service calls traced yet</p>
        {isExecutionRunning && <p className="text-sm mt-1">Waiting for execution to start...</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Service Call Trace</h3>
        <div className="flex items-center gap-2">
          {isExecutionRunning && (
            <span className="flex items-center gap-1 text-sm text-blue-600">
              <span className="animate-pulse">●</span>
              Live
            </span>
          )}
          <span className="text-sm text-gray-500">
            {trace.traces.length} call{trace.traces.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Traces grouped by step */}
      {Object.entries(groupedTraces).map(([stepId, traces]) => (
        <div key={stepId} className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">
            {stepId === 'unknown' ? 'Ungrouped' : `Step: ${stepId}`}
          </h4>
          {traces.map((t) => (
            <TraceEntry key={t.id} trace={t} />
          ))}
        </div>
      ))}
    </div>
  );
}

