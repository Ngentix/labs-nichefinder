import { Server, Database, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface ServiceHealthCardProps {
  name: string;
  port: number;
  status: string;
  responseTimeMs?: number;
  lastCheck?: string;
  error?: string;
}

export function ServiceHealthCard({
  name,
  port,
  status,
  responseTimeMs,
  lastCheck,
  error,
}: ServiceHealthCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'unhealthy':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'unhealthy':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'down':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'unhealthy':
        return 'Unhealthy';
      case 'down':
        return 'Down';
      default:
        return 'Unknown';
    }
  };

  const isDatabase = name.includes('PostgreSQL') || name.includes('Redis') || name.includes('ChromaDB');
  const Icon = isDatabase ? Database : Server;

  const formatLastCheck = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return `${Math.floor(diffSec / 3600)}h ago`;
  };

  return (
    <div className={`border-2 ${getStatusColor()} rounded-lg p-4 transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Port: {port || 'N/A'}</p>
          </div>
        </div>
        {getStatusIcon()}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Status:</span>
          <span className={`font-medium ${
            status === 'healthy' ? 'text-green-600 dark:text-green-400' :
            status === 'unhealthy' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {getStatusText()}
          </span>
        </div>

        {responseTimeMs !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
            <span className="font-medium text-gray-900 dark:text-white">{responseTimeMs}ms</span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Last Check:</span>
          <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatLastCheck(lastCheck)}
          </span>
        </div>

        {error && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-red-600 dark:text-red-400 break-words">
              Error: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

