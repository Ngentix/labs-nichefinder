import { ArrowRight } from 'lucide-react';
import { calculateSignals, generateOpportunitySummary, Insight } from '../../utils/opportunityHelpers';

interface DataSource {
  name: string;
  source_type: string;
  collected_at: string;
  data_points: number;
  metadata: any;
}

interface ScoringDetails {
  demand: number;
  feasibility: number;
  competition: number;
  trend: number;
  composite: number;
  weights: {
    demand: number;
    feasibility: number;
    competition: number;
    trend: number;
  };
}

interface Opportunity {
  id: string;
  name: string;
  category: string;
  score: number;
  scoring_details: ScoringDetails;
  data_sources: DataSource[];
  discovered_at: string;
  metadata: any;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  rank: number;
  delay?: number;
  insight?: Insight;
  onExplore: () => void;
}

// Visual signal components - instrument-grade readouts
function SignalBar({ value, label, inverse = false }: { value: number; label: string; inverse?: boolean }) {
  const fillPercent = inverse ? 100 - value : value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">{label}</span>
        <span className="text-[10px] font-mono text-gray-300">{value.toFixed(0)}</span>
      </div>
      <div className="h-1.5 bg-gray-900/80 rounded-sm overflow-hidden">
        <div
          className="h-full bg-gray-300 transition-all duration-700 ease-out"
          style={{
            width: `${fillPercent}%`,
            animation: `fillBar 0.7s ease-out forwards`
          }}
        />
      </div>
    </div>
  );
}

function TrendSparkline({ trend, momentum }: { trend: number; momentum: 'Rising' | 'Stable' | 'Fading' }) {
  // Generate simple sparkline data based on trend and momentum
  const points = momentum === 'Rising'
    ? [30, 35, 40, 50, 60, 70, trend]
    : momentum === 'Fading'
      ? [70, 65, 60, 55, 50, 45, trend]
      : [50, 52, 48, 51, 49, 50, trend];

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const pathData = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const directionIcon = momentum === 'Rising' ? '↗' : momentum === 'Fading' ? '↘' : '→';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Trend</span>
        <span className="text-[11px] text-gray-300">{directionIcon}</span>
      </div>
      <svg viewBox="0 0 100 24" className="w-full h-6" preserveAspectRatio="none">
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

// Insight type styles for inline callouts
const insightTypeStyles = {
  hot: 'bg-red-500/10 border-red-500/30 text-red-300',
  rising: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
  info: 'bg-gray-500/10 border-gray-600/30 text-gray-300',
};

export function OpportunityCard({ opportunity, rank, delay = 0, insight, onExplore }: OpportunityCardProps) {
  const signals = calculateSignals(opportunity.scoring_details);
  const summary = generateOpportunitySummary(opportunity);
  const scoring = opportunity.scoring_details;

  return (
    <div
      onClick={onExplore}
      className="bg-gray-900/40 backdrop-blur-sm rounded border border-gray-800/50 hover:border-gray-700/50 transition-all duration-500 hover:bg-gray-900/60 group relative overflow-hidden cursor-pointer"
      style={{
        animation: `fadeSlideUp 0.6s ease-out ${delay}ms both`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Subtle inner highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      {/* Minimal Header - Rank, Name, Score */}
      <div className="px-4 py-3 border-b border-gray-800/50 relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-gray-400 tracking-wider">
              #{rank.toString().padStart(2, '0')}
            </span>
            <h3 className="text-sm font-bold text-gray-100 tracking-tight">
              {opportunity.name}
            </h3>
          </div>
          <span className="text-sm font-mono text-gray-200 font-bold">
            {opportunity.score.toFixed(1)}
          </span>
        </div>
        {/* Product Description - Under heading */}
        <p className="text-sm leading-relaxed text-gray-300 font-light pl-9">
          {summary}
        </p>
      </div>

      {/* Signal Strip - Primary Payload (Visual-First) */}
      <div className="px-4 py-3 space-y-2.5 relative bg-gray-950/20">
        {/* Demand Bar */}
        <SignalBar value={scoring.demand} label="Demand" />

        {/* Competition Bar (inverse - high competition = more fill) */}
        <SignalBar value={scoring.competition} label="Competition" inverse />

        {/* Feasibility Bar */}
        <SignalBar value={scoring.feasibility} label="Feasibility" />

        {/* Trend Sparkline - Mandatory */}
        <TrendSparkline trend={scoring.trend} momentum={signals.momentum} />
      </div>

      {/* Intelligence Callout - Contextual insight */}
      {insight && (
        <div className={`mx-4 my-3 px-3 py-2 rounded border ${insightTypeStyles[insight.type]} transition-all duration-300`}>
          <div className="flex items-start gap-2">
            <span className="text-sm flex-shrink-0 opacity-90">{insight.icon}</span>
            <p className="text-xs leading-relaxed font-light">
              {insight.text.replace(opportunity.name, '').trim()}
            </p>
          </div>
        </div>
      )}

      {/* CTA - Command style */}
      <div className="px-4 py-3 border-t border-gray-800/50 relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExplore();
          }}
          className="w-full flex items-center justify-center gap-2 bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 hover:border-gray-600/50 text-gray-200 font-medium text-xs py-2 px-4 rounded transition-all duration-300 uppercase tracking-widest"
        >
          Explore
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

