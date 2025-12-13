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

interface MatrixViewProps {
  opportunities: Opportunity[];
  onExploreOpportunity: (opportunity: Opportunity) => void;
}

// Cell component for visual encoding
function SignalCell({ value, inverse = false }: { value: number; inverse?: boolean }) {
  const displayValue = inverse ? 100 - value : value;
  const intensity = Math.floor((displayValue / 100) * 5); // 0-5 scale
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-6 rounded-sm ${
              i < intensity ? 'bg-gray-300' : 'bg-gray-900/80'
            }`}
            style={{
              animation: i < intensity ? `fillBar 0.5s ease-out ${i * 100}ms both` : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Trend cell with directional indicator
function TrendCell({ trend, momentum }: { trend: number; momentum: 'Rising' | 'Stable' | 'Fading' }) {
  const directionIcon = momentum === 'Rising' ? '↗' : momentum === 'Fading' ? '↘' : '→';
  const color = momentum === 'Rising' ? 'text-gray-300' : momentum === 'Fading' ? 'text-gray-600' : 'text-gray-500';
  
  return (
    <div className="flex items-center justify-center gap-2 h-full">
      <span className={`text-lg ${color}`}>{directionIcon}</span>
      <span className="text-xs font-mono text-gray-500">{trend.toFixed(0)}</span>
    </div>
  );
}

export function MatrixView({ opportunities, onExploreOpportunity }: MatrixViewProps) {
  return (
    <div className="bg-gray-900/40 backdrop-blur-sm rounded border border-gray-800/50 overflow-hidden">
      {/* Column Headers */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-800/50 bg-gray-950/40">
        <div className="px-6 py-3 border-r border-gray-800/50">
          <span className="text-[9px] uppercase tracking-widest text-gray-600 font-medium">
            Opportunity
          </span>
        </div>
        <div className="px-4 py-3 border-r border-gray-800/50 text-center">
          <span className="text-[9px] uppercase tracking-widest text-gray-600 font-medium">
            Demand
          </span>
        </div>
        <div className="px-4 py-3 border-r border-gray-800/50 text-center">
          <span className="text-[9px] uppercase tracking-widest text-gray-600 font-medium">
            Feasibility
          </span>
        </div>
        <div className="px-4 py-3 border-r border-gray-800/50 text-center">
          <span className="text-[9px] uppercase tracking-widest text-gray-600 font-medium">
            Competition
          </span>
        </div>
        <div className="px-4 py-3 border-r border-gray-800/50 text-center">
          <span className="text-[9px] uppercase tracking-widest text-gray-600 font-medium">
            Trend
          </span>
        </div>
        <div className="px-4 py-3 text-center">
          <span className="text-[9px] uppercase tracking-widest text-gray-600 font-medium">
            Score
          </span>
        </div>
      </div>

      {/* Data Rows */}
      <div>
        {opportunities.map((opportunity, index) => {
          const signals = calculateSignals(opportunity.scoring_details);
          const scoring = opportunity.scoring_details;
          
          return (
            <div
              key={opportunity.id}
              onClick={() => onExploreOpportunity(opportunity)}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-800/50 hover:bg-gray-900/60 transition-all duration-300 cursor-pointer group"
              style={{
                animation: `fadeSlideUp 0.5s ease-out ${index * 40}ms both`,
              }}
            >
              {/* Name Column */}
              <div className="px-6 py-4 border-r border-gray-800/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-600 w-6">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-100 tracking-tight">
                      {opportunity.name}
                    </h3>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wide">
                      {opportunity.category.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Signal Cells */}
              <div className="border-r border-gray-800/50">
                <SignalCell value={scoring.demand} />
              </div>
              <div className="border-r border-gray-800/50">
                <SignalCell value={scoring.feasibility} />
              </div>
              <div className="border-r border-gray-800/50">
                <SignalCell value={scoring.competition} inverse />
              </div>
              <div className="border-r border-gray-800/50">
                <TrendCell trend={scoring.trend} momentum={signals.momentum} />
              </div>
              <div className="flex items-center justify-center">
                <span className="text-base font-mono text-gray-300 font-bold">
                  {opportunity.score.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

