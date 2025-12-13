import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiClient } from '../api/client';
import { ArchitectureDiagram } from '../components/system/ArchitectureDiagram';
import { ServiceHealthCard } from '../components/system/ServiceHealthCard';
import { SystemStats } from '../components/system/SystemStats';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';

interface ServiceStatus {
  name: string;
  port: number;
  status: string;
  response_time_ms?: number;
  last_check?: string;
  error?: string;
}

interface SystemStats {
  total_workflows: number;
  total_executions: number;
  total_artifacts: number;
  total_opportunities: number;
  last_execution?: string;
}

export function SystemOverview() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [statusResponse, statsResponse] = await Promise.all([
        apiClient.getSystemStatus(),
        apiClient.getSystemStats(),
      ]);

      setServices(statusResponse.services || []);
      setStats(statsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Poll every 10 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchData(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
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

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          System Overview
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* System Statistics */}
      {stats && <SystemStats stats={stats} />}

      {/* Architecture Diagram */}
      <ArchitectureDiagram services={services} />

      {/* Service Health Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Service Health Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <ServiceHealthCard
              key={service.name}
              name={service.name}
              port={service.port}
              status={service.status}
              responseTimeMs={service.response_time_ms}
              lastCheck={service.last_check}
              error={service.error}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

