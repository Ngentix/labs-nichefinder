import { useState } from 'react';
import { ChevronDown, ChevronRight, Package, AlertCircle } from 'lucide-react';

interface ServiceCall {
  timestamp: string;
  execution_id?: string;
  service_from: string;
  service_to: string;
  method: string;
  url: string;
  status: number;
  duration_ms: number;
  artifact_id?: string;
}

interface AggregatedServiceCallType {
  operation: string;
  service_from: string;
  service_to: string;
  method: string;
  call_count: number;
  success_count: number;
  failure_count: number;
  avg_duration: number;
  min_duration: number;
  max_duration: number;
  timestamp: string;
  details: ServiceCall[];
}

interface AggregatedServiceCallProps {
  aggregated: AggregatedServiceCallType;
}

export function AggregatedServiceCall({ aggregated }: AggregatedServiceCallProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getOperationIcon = (operation: string) => {
    if (operation === 'artifact_download') return <Package size={16} className="text-blue-500" />;
    if (operation === 'artifact_fetch') return <Package size={16} className="text-purple-500" />;
    return <Package size={16} className="text-gray-500" />;
  };

  const getOperationLabel = (operation: string) => {
    if (operation === 'artifact_download') return 'Artifact Download';
    if (operation === 'artifact_fetch') return 'Artifact Fetch';
    return operation;
  };

  const successRate = aggregated.call_count > 0
    ? Math.round((aggregated.success_count / aggregated.call_count) * 100)
    : 0;

  const hasFailures = aggregated.failure_count > 0;

  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      {/* Header - Always visible */}
      <div
        className={`flex items-center justify-between p-3 cursor-pointer ${
          hasFailures ? 'bg-red-50 hover:bg-red-100' : 'bg-blue-50 hover:bg-blue-100'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          <button className="text-gray-500">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          <div className="flex items-center gap-2">
            {getOperationIcon(aggregated.operation)}
            <span className="text-sm font-semibold text-gray-700">
              {aggregated.service_from} → {aggregated.service_to}
            </span>
          </div>

          <span className="text-xs text-gray-500">
            {getOperationLabel(aggregated.operation)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            {aggregated.call_count} call{aggregated.call_count !== 1 ? 's' : ''}
          </span>
          
          {hasFailures ? (
            <div className="flex items-center gap-1 text-red-600 font-semibold">
              <AlertCircle size={14} />
              <span>{successRate}% success</span>
            </div>
          ) : (
            <span className="text-green-600 font-semibold">100% success</span>
          )}

          <span className="text-gray-600">
            {formatDuration(aggregated.min_duration)}-{formatDuration(aggregated.max_duration)}
          </span>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-4 bg-white border-t border-gray-200 space-y-3">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-200">
            <div>
              <div className="text-xs text-gray-500 uppercase">Total Calls</div>
              <div className="text-lg font-semibold">{aggregated.call_count}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">Success Rate</div>
              <div className={`text-lg font-semibold ${hasFailures ? 'text-red-600' : 'text-green-600'}`}>
                {successRate}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">Avg Duration</div>
              <div className="text-lg font-semibold">{formatDuration(Math.round(aggregated.avg_duration))}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">Duration Range</div>
              <div className="text-sm font-semibold">
                {formatDuration(aggregated.min_duration)} - {formatDuration(aggregated.max_duration)}
              </div>
            </div>
          </div>

          {/* Individual Calls */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Individual Calls</h4>
            <div className="space-y-1">
              {aggregated.details.map((call, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-blue-600">{call.method}</span>
                    <span className="text-gray-600 truncate max-w-md">{call.url}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={call.status >= 200 && call.status < 300 ? 'text-green-600' : 'text-red-600'}>
                      {call.status}
                    </span>
                    <span className="text-gray-600">{formatDuration(call.duration_ms)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

