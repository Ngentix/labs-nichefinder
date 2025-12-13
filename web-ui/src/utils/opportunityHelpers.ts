/**
 * Utility functions for opportunity data processing
 * Deterministic, client-side only, no LLM
 */

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

/**
 * Generate a deterministic summary for an opportunity
 * Based on available data, no hallucination
 */
export function generateOpportunitySummary(opportunity: Opportunity): string {
  const parts: string[] = [];

  // Base description from metadata or name
  const baseDesc = opportunity.metadata?.description || opportunity.name;
  parts.push(baseDesc);

  // Add activity indicator
  const githubSource = opportunity.data_sources.find(ds => ds.source_type === 'git_hub');
  if (githubSource?.metadata?.pushed_at) {
    const daysSinceUpdate = getDaysSince(githubSource.metadata.pushed_at);
    if (daysSinceUpdate <= 90) {
      parts.push('Active recently');
    }
  }

  // Add popularity indicator
  const stars = githubSource?.metadata?.stars || 0;
  const hacsSource = opportunity.data_sources.find(ds => ds.source_type === 'hacs');
  const downloads = hacsSource?.metadata?.downloads || 0;

  if (stars > 500 || downloads > 1000) {
    parts.push('Popular');
  }

  // Add community attention
  const youtubeSource = opportunity.data_sources.find(ds =>
    ds.source_type === 'youtube' || (typeof ds.source_type === 'object' && 'other' in ds.source_type)
  );
  if (youtubeSource && youtubeSource.data_points > 0) {
    parts.push('Community attention');
  }

  return parts.join('. ') + '.';
}

/**
 * Calculate signal levels from scoring details
 */
export function calculateSignals(scoring: ScoringDetails) {
  return {
    demand: getSignalLevel(scoring.demand),
    momentum: getMomentumLevel(scoring.trend),
    buildability: getBuildabilityLevel(scoring.feasibility),
  };
}

function getSignalLevel(score: number): 'High' | 'Med' | 'Low' {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Med';
  return 'Low';
}

function getMomentumLevel(score: number): 'Rising' | 'Stable' | 'Fading' {
  if (score >= 70) return 'Rising';
  if (score >= 40) return 'Stable';
  return 'Fading';
}

function getBuildabilityLevel(score: number): 'Solo-friendly' | 'Complex' | 'Hard' {
  if (score >= 70) return 'Solo-friendly';
  if (score >= 40) return 'Complex';
  return 'Hard';
}

/**
 * Get days since a date string
 */
function getDaysSince(dateStr: string): number {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return Infinity;
  }
}

/**
 * Generate builder questions and answers
 */
export function generateBuilderQuestions(opportunity: Opportunity) {
  const githubSource = opportunity.data_sources.find(ds => ds.source_type === 'git_hub');
  const openIssues = githubSource?.metadata?.open_issues || 0;
  const stars = githubSource?.metadata?.stars || 0;

  return [
    {
      question: 'What user pain does this solve?',
      answer: `Integration for ${opportunity.name} in Home Assistant ecosystem`,
      why: `Based on ${stars} GitHub stars and community interest`,
    },
    {
      question: 'Is momentum rising or fading?',
      answer: getMomentumLevel(opportunity.scoring_details.trend),
      why: `Trend score: ${opportunity.scoring_details.trend.toFixed(1)}/100`,
    },
    {
      question: 'Can I build this solo?',
      answer: getBuildabilityLevel(opportunity.scoring_details.feasibility),
      why: `Feasibility score: ${opportunity.scoring_details.feasibility.toFixed(1)}/100`,
    },
    {
      question: 'Is this a niche or mass market?',
      answer: stars > 1000 ? 'Mass market' : 'Niche',
      why: `${stars} stars indicates ${stars > 1000 ? 'broad' : 'focused'} appeal`,
    },
    {
      question: 'What\'s the upside?',
      answer: `Score: ${opportunity.score.toFixed(1)}/100`,
      why: `Composite of demand (${opportunity.scoring_details.demand.toFixed(1)}), feasibility (${opportunity.scoring_details.feasibility.toFixed(1)}), competition (${opportunity.scoring_details.competition.toFixed(1)})`,
    },
    {
      question: 'What\'s the risk?',
      answer: openIssues > 20 ? 'High maintenance burden' : 'Manageable',
      why: `${openIssues} open issues`,
    },
  ];
}

/**
 * Generate "Why this ranks highly" bullets
 */
export function generateRankingReasons(opportunity: Opportunity): string[] {
  const reasons: string[] = [];
  const scoring = opportunity.scoring_details;

  if (scoring.demand >= 70) {
    reasons.push(`Strong demand signal (${scoring.demand.toFixed(1)}/100)`);
  }

  if (scoring.feasibility >= 70) {
    reasons.push(`High feasibility for solo builder (${scoring.feasibility.toFixed(1)}/100)`);
  }

  if (scoring.competition <= 40) {
    reasons.push(`Low competition (${scoring.competition.toFixed(1)}/100)`);
  }

  if (scoring.trend >= 70) {
    reasons.push(`Rising trend (${scoring.trend.toFixed(1)}/100)`);
  }

  // Fallback if no strong signals
  if (reasons.length === 0) {
    reasons.push(`Balanced opportunity with composite score of ${scoring.composite.toFixed(1)}/100`);
  }

  return reasons.slice(0, 3); // Max 3 bullets
}

