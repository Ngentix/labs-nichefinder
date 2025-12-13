import { KpiCard } from './KpiCard';
import { OpportunityCard } from './OpportunityCard';
import { InsightFeed } from './InsightFeed';
import { calculateKPIs, generateInsights } from '../../utils/opportunityHelpers';
import { Table } from 'lucide-react';

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
  const kpis = calculateKPIs(opportunities);
  const insights = generateInsights(opportunities);
  const topOpportunities = opportunities.slice(0, 9); // Show top 9 cards

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
        <button
          onClick={onOpenResearchExplorer}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 hover:border-gray-600/50 text-gray-300 rounded transition-all duration-300 text-sm uppercase tracking-wide font-medium"
        >
          <Table className="w-3.5 h-3.5" />
          Research Explorer
        </button>
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

      {/* Opportunity Cards Grid - Panels */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-6">
          Top Opportunities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topOpportunities.map((opp, index) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              rank={index + 1}
              delay={450 + index * 60}
              onExplore={() => onExploreOpportunity(opp)}
            />
          ))}
        </div>
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

