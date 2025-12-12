import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  RefreshCw, 
  BarChart3, 
  Package 
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const tabs: Tab[] = [
  {
    id: 'system',
    label: 'System Overview',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: '/',
  },
  {
    id: 'workflow',
    label: 'Workflow Execution',
    icon: <Zap className="w-5 h-5" />,
    path: '/workflow',
  },
  {
    id: 'pipeline',
    label: 'Data Pipeline',
    icon: <RefreshCw className="w-5 h-5" />,
    path: '/pipeline',
  },
  {
    id: 'results',
    label: 'Results',
    icon: <BarChart3 className="w-5 h-5" />,
    path: '/results',
  },
  {
    id: 'artifacts',
    label: 'Artifacts',
    icon: <Package className="w-5 h-5" />,
    path: '/artifacts',
  },
];

export function TabNavigation() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex px-6">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            end={tab.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                isActive
                  ? 'border-primary text-primary dark:text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

