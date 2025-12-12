import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export type Status = 'healthy' | 'unhealthy' | 'pending' | 'running' | 'completed' | 'failed' | 'unknown';

interface StatusBadgeProps {
  status: Status;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Healthy',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Completed',
  },
  unhealthy: {
    icon: XCircle,
    color: 'text-error',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Unhealthy',
  },
  failed: {
    icon: XCircle,
    color: 'text-error',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Failed',
  },
  pending: {
    icon: Clock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    label: 'Pending',
  },
  running: {
    icon: AlertCircle,
    color: 'text-primary',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Running',
  },
  unknown: {
    icon: AlertCircle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    label: 'Unknown',
  },
};

const sizeConfig = {
  sm: { icon: 'w-3 h-3', text: 'text-xs', padding: 'px-2 py-0.5' },
  md: { icon: 'w-4 h-4', text: 'text-sm', padding: 'px-2.5 py-1' },
  lg: { icon: 'w-5 h-5', text: 'text-base', padding: 'px-3 py-1.5' },
};

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${config.bgColor} ${sizeStyles.padding}`}
    >
      <Icon className={`${config.color} ${sizeStyles.icon}`} />
      <span className={`${config.color} font-medium ${sizeStyles.text}`}>
        {displayLabel}
      </span>
    </span>
  );
}

