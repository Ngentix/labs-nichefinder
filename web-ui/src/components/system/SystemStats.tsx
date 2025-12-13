import { Activity, Package, Target, Clock } from 'lucide-react';

interface SystemStatsProps {
  stats: {
    total_workflows: number;
    total_executions: number;
    total_artifacts: number;
    total_opportunities: number;
    last_execution?: string;
  };
}

export function SystemStats({ stats }: SystemStatsProps) {
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color 
  }: { 
    icon: any; 
    label: string; 
    value: string | number; 
    color: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        System Statistics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Total Workflows"
          value={stats.total_workflows}
          color="bg-blue-500"
        />
        
        <StatCard
          icon={Activity}
          label="Total Executions"
          value={stats.total_executions}
          color="bg-purple-500"
        />
        
        <StatCard
          icon={Package}
          label="Total Artifacts"
          value={stats.total_artifacts}
          color="bg-green-500"
        />
        
        <StatCard
          icon={Target}
          label="Opportunities"
          value={stats.total_opportunities}
          color="bg-orange-500"
        />
      </div>

      {stats.last_execution && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Last Execution:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatTimestamp(stats.last_execution)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({new Date(stats.last_execution).toLocaleString()})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

