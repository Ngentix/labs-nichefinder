import { useState } from 'react';
import { KpiCard } from './KpiCard';
import { CardsView } from './CardsView';
import { SignalLanesView } from './SignalLanesView';
import { MatrixView } from './MatrixView';
import { InsightFeed } from './InsightFeed';
import { calculateKPIs, generateInsights } from '../../utils/opportunityHelpers';
import { Table, LayoutGrid, List, Grid3x3 } from 'lucide-react';

type LayoutMode = 'cards' | 'lanes' | 'matrix';

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

interface OpportunitiesCommandCenterProps {
  opportunities: Opportunity[];
  onExploreOpportunity: (opportunity: Opportunity) => void;
  onOpenResearchExplorer: () => void;
}

export function OpportunitiesCommandCenter({
  opportunities,
  onExploreOpportunity,
  onOpenResearchExplorer,
}: OpportunitiesCommandCenterProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('cards');
  const kpis = calculateKPIs(opportunities);
  const insights = generateInsights(opportunities);

  return (
    <div className="space-y-10 pb-12">
      {/* Header - Cinematic */}
      <div className="flex items-center justify-between border-b border-gray-800/50 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-1 tracking-tight">
            Opportunities Command Center
          </h2>
          <p className="text-sm text-gray-500 font-light">
            Intelligence-driven opportunity discovery
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Layout Toggle */}
          <div className="flex items-center gap-1 bg-gray-900/60 border border-gray-800/50 rounded p-1">
            <button
              onClick={() => setLayoutMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs uppercase tracking-wide font-medium transition-all duration-200 ${layoutMode === 'cards'
                ? 'bg-gray-700/80 text-gray-100'
                : 'text-gray-500 hover:text-gray-300'
                }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setLayoutMode('lanes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs uppercase tracking-wide font-medium transition-all duration-200 ${layoutMode === 'lanes'
                ? 'bg-gray-700/80 text-gray-100'
                : 'text-gray-500 hover:text-gray-300'
                }`}
              title="Signal Lanes View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Lanes</span>
            </button>
            <button
              onClick={() => setLayoutMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs uppercase tracking-wide font-medium transition-all duration-200 ${layoutMode === 'matrix'
                ? 'bg-gray-700/80 text-gray-100'
                : 'text-gray-500 hover:text-gray-300'
                }`}
              title="Matrix View"
            >
              <Grid3x3 className="w-3.5 h-3.5" />
              <span>Matrix</span>
            </button>
          </div>

          <button
            onClick={onOpenResearchExplorer}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 hover:border-gray-600/50 text-gray-300 rounded transition-all duration-300 text-sm uppercase tracking-wide font-medium"
          >
            <Table className="w-3.5 h-3.5" />
            Research Explorer
          </button>
        </div>
      </div>

      {/* KPI Ribbon - System Activating */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Opportunities"
          value={kpis.totalOpportunities}
          delay={0}
        />
        <KpiCard
          label="Avg Demand Score"
          value={kpis.avgDemandScore.toFixed(1)}
          trend={kpis.avgDemandScore >= 70 ? 'up' : 'neutral'}
          delay={100}
        />
        <KpiCard
          label="Trending Opportunities"
          value={kpis.trendingCount}
          trend={kpis.trendingCount > 0 ? 'up' : 'neutral'}
          delay={200}
        />
        <KpiCard
          label="Highest Upside"
          value={kpis.highestOpportunity?.name || 'N/A'}
          delay={300}
        />
      </div>

      {/* Opportunity Views - Layout-Dependent */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-6">
          Top Opportunities
        </h3>
        {layoutMode === 'cards' && (
          <CardsView
            opportunities={opportunities}
            insights={insights}
            onExploreOpportunity={onExploreOpportunity}
          />
        )}
        {layoutMode === 'lanes' && (
          <SignalLanesView
            opportunities={opportunities}
            insights={insights}
            onExploreOpportunity={onExploreOpportunity}
          />
        )}
        {layoutMode === 'matrix' && (
          <MatrixView
            opportunities={opportunities}
            insights={insights}
            onExploreOpportunity={onExploreOpportunity}
          />
        )}
      </div>

      {/* Insight Feed */}
      {insights.length > 0 && (
        <div className="max-w-3xl">
          <InsightFeed
            insights={insights}
            onInsightClick={(oppId) => {
              const opp = opportunities.find(o => o.id === oppId);
              if (opp) onExploreOpportunity(opp);
            }}
          />
        </div>
      )}

      {/* Bottom CTA - Command Style */}
      <div className="flex justify-center pt-10">
        <button
          onClick={onOpenResearchExplorer}
          className="px-8 py-3 bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 hover:border-gray-600/50 text-gray-200 rounded transition-all duration-300 text-sm uppercase tracking-widest font-medium"
        >
          View All in Research Explorer →
        </button>
      </div>
    </div>
  );
}

