import { ArrowRight } from 'lucide-react';
import { calculateSignals } from '../../utils/opportunityHelpers';

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

interface SignalLanesViewProps {
  opportunities: Opportunity[];
  onExploreOpportunity: (opportunity: Opportunity) => void;
}

// Shared signal bar component
function SignalBar({ value, width = 100 }: { value: number; width?: number }) {
  return (
    <div className="h-2 bg-gray-900/80 rounded-sm overflow-hidden" style={{ width: `${width}px` }}>
      <div 
        className="h-full bg-gray-300 transition-all duration-700 ease-out"
        style={{ 
          width: `${value}%`,
          animation: `fillBar 0.7s ease-out forwards`
        }}
      />
    </div>
  );
}

// Trend sparkline component
function TrendSparkline({ trend, momentum }: { trend: number; momentum: 'Rising' | 'Stable' | 'Fading' }) {
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
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 100 24" className="w-20 h-6" preserveAspectRatio="none">
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="text-xs text-gray-500">{directionIcon}</span>
    </div>
  );
}

export function SignalLanesView({ opportunities, onExploreOpportunity }: SignalLanesViewProps) {
  return (
    <div className="space-y-1">
      {opportunities.map((opportunity, index) => {
        const signals = calculateSignals(opportunity.scoring_details);
        const scoring = opportunity.scoring_details;
        
        return (
          <div
            key={opportunity.id}
            onClick={() => onExploreOpportunity(opportunity)}
            className="bg-gray-900/40 backdrop-blur-sm border-b border-gray-800/50 hover:bg-gray-900/60 transition-all duration-300 cursor-pointer group"
            style={{
              animation: `fadeSlideUp 0.5s ease-out ${index * 50}ms both`,
            }}
          >
            <div className="px-6 py-4 flex items-center gap-6">
              {/* Rank + Name */}
              <div className="w-64 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-600 w-8">
                    #{(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-100 tracking-tight">
                      {opportunity.name}
                    </h3>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {opportunity.category.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Signal Bars */}
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Demand</div>
                  <SignalBar value={scoring.demand} width={120} />
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Feasibility</div>
                  <SignalBar value={scoring.feasibility} width={120} />
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Competition</div>
                  <SignalBar value={100 - scoring.competition} width={120} />
                </div>
              </div>

              {/* Trend */}
              <div className="w-32 flex-shrink-0">
                <TrendSparkline trend={scoring.trend} momentum={signals.momentum} />
              </div>

              {/* Score + CTA */}
              <div className="w-24 flex-shrink-0 flex items-center justify-end gap-3">
                <span className="text-lg font-mono text-gray-300 font-bold">
                  {opportunity.score.toFixed(1)}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

