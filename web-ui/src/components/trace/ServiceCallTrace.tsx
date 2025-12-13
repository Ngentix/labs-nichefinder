import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { ExecutionTrace, TraceEntry as TraceEntryType } from '../../types/api';
import { TraceEntry } from './TraceEntry';
import { AggregatedServiceCall } from './AggregatedServiceCall';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Activity } from 'lucide-react';

interface ServiceCallTraceProps {
  executionId: string;
  isExecutionRunning: boolean;
}

export function ServiceCallTrace({ executionId, isExecutionRunning }: ServiceCallTraceProps) {
  const [trace, setTrace] = useState<ExecutionTrace | null>(null);
  const [serviceCalls, setServiceCalls] = useState<any>(null);
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

  const fetchServiceCalls = async () => {
    try {
      const data = await apiClient.getExecutionServiceCalls(executionId);
      setServiceCalls(data);
    } catch (err) {
      console.error('Failed to fetch service calls:', err);
      // Don't set error state - service calls are optional
    }
  };

  useEffect(() => {
    fetchTrace();
    fetchServiceCalls();
  }, [executionId]);

  // Poll for updates while execution is running
  useEffect(() => {
    if (!isExecutionRunning) return;

    const interval = setInterval(() => {
      fetchTrace();
      fetchServiceCalls();
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

  const totalCalls = trace.traces.length + (serviceCalls?.aggregated_calls?.length || 0);

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
            {totalCalls} interaction{totalCalls !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Aggregated Service Calls from nichefinder-server */}
      {serviceCalls?.aggregated_calls && serviceCalls.aggregated_calls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">
            nichefinder-server → peg-engine
          </h4>
          {serviceCalls.aggregated_calls.map((agg: any, idx: number) => (
            <AggregatedServiceCall key={idx} aggregated={agg} />
          ))}
        </div>
      )}

      {/* Traces grouped by step from peg-engine */}
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

