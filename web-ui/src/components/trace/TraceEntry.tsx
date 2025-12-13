import { useState } from 'react';
import { TraceEntry as TraceEntryType } from '../../types/api';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TraceEntryProps {
  trace: TraceEntryType;
}

export function TraceEntry({ trace }: TraceEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDuration = (ms: number | null) => {
    if (ms === null) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (status: number | null) => {
    if (status === null) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400) return 'text-red-600';
    return 'text-yellow-600';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          <button className="text-gray-500">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-blue-600">
              {trace.method}
            </span>
            <span className="text-sm text-gray-700">
              {trace.serviceFrom} → {trace.serviceTo}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">{formatTimestamp(trace.timestamp)}</span>
          <span className={`font-semibold ${getStatusColor(trace.responseStatus)}`}>
            {trace.responseStatus || 'N/A'}
          </span>
          <span className="text-gray-600">{formatDuration(trace.durationMs)}</span>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-4 bg-white border-t border-gray-200 space-y-4">
          {/* URL */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">URL</h4>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded block break-all">
              {trace.url}
            </code>
          </div>

          {/* Request Headers */}
          {trace.requestHeaders && Object.keys(trace.requestHeaders).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Request Headers</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(trace.requestHeaders, null, 2)}
              </pre>
            </div>
          )}

          {/* Request Body */}
          {trace.requestBody && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Request Body</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-64 overflow-y-auto">
                {typeof trace.requestBody === 'string'
                  ? trace.requestBody
                  : JSON.stringify(trace.requestBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Response Headers */}
          {trace.responseHeaders && Object.keys(trace.responseHeaders).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Response Headers</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(trace.responseHeaders, null, 2)}
              </pre>
            </div>
          )}

          {/* Response Body */}
          {trace.responseBody && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Response Body</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-64 overflow-y-auto">
                {typeof trace.responseBody === 'string'
                  ? trace.responseBody
                  : JSON.stringify(trace.responseBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {trace.error && (
            <div>
              <h4 className="text-xs font-semibold text-red-600 uppercase mb-1">Error</h4>
              <div className="text-sm bg-red-50 text-red-700 p-2 rounded">
                {trace.error}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
            {trace.jobId && (
              <div>
                <span className="text-xs text-gray-500">Job ID:</span>
                <code className="text-xs ml-2">{trace.jobId}</code>
              </div>
            )}
            {trace.stepId && (
              <div>
                <span className="text-xs text-gray-500">Step ID:</span>
                <code className="text-xs ml-2">{trace.stepId}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

