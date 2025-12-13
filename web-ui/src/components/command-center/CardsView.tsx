import { OpportunityCard } from './OpportunityCard';
import { Insight } from '../../utils/opportunityHelpers';

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

interface CardsViewProps {
  opportunities: Opportunity[];
  insights: Insight[];
  onExploreOpportunity: (opportunity: Opportunity) => void;
}

export function CardsView({ opportunities, insights, onExploreOpportunity }: CardsViewProps) {
  const topOpportunities = opportunities.slice(0, 9); // Show top 9 cards

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {topOpportunities.map((opp, index) => {
        const insight = insights.find(i => i.opportunityId === opp.id);

        return (
          <OpportunityCard
            key={opp.id}
            opportunity={opp}
            rank={index + 1}
            delay={450 + index * 60}
            insight={insight}
            onExplore={() => onExploreOpportunity(opp)}
          />
        );
      })}
    </div>
  );
}

