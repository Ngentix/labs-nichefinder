import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
}

export function KpiCard({ label, value, trend, delay = 0 }: KpiCardProps) {
  return (
    <div
      className="bg-gray-900/40 backdrop-blur-sm rounded border border-gray-800/50 hover:border-gray-700/50 transition-all duration-500 hover:bg-gray-900/60 relative overflow-hidden"
      style={{
        animation: `fadeSlideUp 0.7s ease-out ${delay}ms both`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Subtle inner highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative">
        {/* Label */}
        <div className="px-4 py-2 border-b border-gray-800/50">
          <p className="text-[9px] font-medium text-gray-600 uppercase tracking-widest">
            {label}
          </p>
        </div>

        {/* Value - Large Numeral */}
        <div className="px-4 py-4 flex items-center justify-between">
          <p className="text-4xl font-bold text-gray-100 font-mono tracking-tighter">
            {value}
          </p>
          {trend && trend !== 'neutral' && (
            <div className="flex items-center">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-gray-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
          )}
        </div>

        {/* Micro-chart placeholder - subtle indicator bar */}
        <div className="px-4 pb-3">
          <div className="h-0.5 bg-gray-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-600"
              style={{
                width: trend === 'up' ? '75%' : trend === 'down' ? '25%' : '50%',
                animation: `fillBar 0.7s ease-out ${delay + 200}ms both`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

