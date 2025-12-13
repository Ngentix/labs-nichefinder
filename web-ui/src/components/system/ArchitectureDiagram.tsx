import { Server, Database, Cloud, Zap } from 'lucide-react';

interface ServiceNode {
  id: string;
  name: string;
  port: number;
  status?: string;
  type: 'service' | 'database' | 'external';
}

interface ArchitectureDiagramProps {
  services: Array<{
    name: string;
    port: number;
    status: string;
  }>;
}

export function ArchitectureDiagram({ services }: ArchitectureDiagramProps) {
  // Map services to nodes
  const getServiceStatus = (name: string) => {
    const service = services.find(s => s.name === name);
    return service?.status || 'unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500 border-green-500';
      case 'unhealthy':
        return 'text-yellow-500 border-yellow-500';
      case 'down':
        return 'text-red-500 border-red-500';
      default:
        return 'text-gray-500 border-gray-500';
    }
  };

  const ServiceBox = ({ name, port, type }: ServiceNode) => {
    const status = getServiceStatus(name);
    const statusColor = getStatusColor(status);
    
    const Icon = type === 'database' ? Database : type === 'external' ? Cloud : Server;
    
    return (
      <div className={`border-2 ${statusColor} rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md min-w-[160px]`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-5 h-5 ${statusColor}`} />
          <div className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-green-500' : status === 'down' ? 'bg-red-500' : 'bg-yellow-500'}`} />
        </div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white">{name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">:{port}</div>
      </div>
    );
  };

  const Arrow = ({ direction = 'right' }: { direction?: 'right' | 'down' }) => {
    if (direction === 'down') {
      return (
        <div className="flex justify-center">
          <Zap className="w-6 h-6 text-blue-500 rotate-90" />
        </div>
      );
    }
    return <Zap className="w-6 h-6 text-blue-500" />;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        System Architecture
      </h3>
      
      {/* Top Layer: Frontend */}
      <div className="flex justify-center mb-6">
        <ServiceBox id="frontend" name="Frontend UI" port={5173} type="service" />
      </div>

      <Arrow direction="down" />

      {/* Middle Layer: nichefinder-server */}
      <div className="flex justify-center mb-6">
        <ServiceBox id="nichefinder-server" name="nichefinder-server" port={3001} type="service" />
      </div>

      <Arrow direction="down" />

      {/* Core Services Layer */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <ServiceBox id="peg-engine" name="peg-engine" port={3007} type="service" />
        <Arrow />
        <ServiceBox id="credential-vault" name="credential-vault" port={3005} type="service" />
        <Arrow />
        <ServiceBox id="peg-connector" name="PEG-Connector-Service" port={9004} type="service" />
      </div>

      <Arrow direction="down" />

      {/* Infrastructure Layer */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <ServiceBox id="postgres-peg" name="PostgreSQL (peg-engine)" port={5436} type="database" />
        <ServiceBox id="postgres-main" name="PostgreSQL (main)" port={5433} type="database" />
        <ServiceBox id="redis-peg" name="Redis (peg-engine)" port={5379} type="database" />
        <ServiceBox id="redis-main" name="Redis (main)" port={6380} type="database" />
        <ServiceBox id="chromadb" name="ChromaDB" port={8000} type="database" />
      </div>

      <Arrow direction="down" />

      {/* External APIs */}
      <div className="flex justify-center items-center gap-4">
        <ServiceBox id="hacs" name="HACS API" port={0} type="external" />
        <ServiceBox id="github" name="GitHub API" port={0} type="external" />
        <ServiceBox id="youtube" name="YouTube API" port={0} type="external" />
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Unhealthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Down</span>
          </div>
        </div>
      </div>
    </div>
  );
}

