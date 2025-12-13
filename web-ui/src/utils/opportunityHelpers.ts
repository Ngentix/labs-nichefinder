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
 * Generate a product description for an opportunity
 * Describes WHAT the user would build, not viability
 * Uses name, category, and metadata to derive description
 */
export function generateOpportunitySummary(opportunity: Opportunity): string {
  const name = opportunity.name.toLowerCase();
  const category = opportunity.category.toLowerCase();
  const topics = opportunity.metadata?.topics || [];

  // Known integration descriptions based on name/category patterns
  const descriptions: Record<string, string> = {
    // Xiaomi ecosystem
    'xiaomi_home': 'Connect and control Xiaomi smart home devices (lights, sensors, cameras) through the MIoT protocol.',
    'xiaomi_miot': 'Advanced Xiaomi MIoT integration supporting hundreds of device types with automatic discovery.',
    'xiaomi_cloud_map_extractor': 'Extract and display real-time vacuum cleaner maps from Xiaomi Cloud for robot vacuums.',

    // Popular platforms
    'hacs': 'Community store for custom integrations, themes, and plugins — the unofficial app store for Home Assistant.',
    'alexa_media': 'Control Amazon Alexa devices and use them as media players, TTS speakers, and automation triggers.',
    'yandex_station': 'Integrate Yandex smart speakers for voice control, media playback, and smart home commands.',

    // Lighting & automation
    'adaptive_lighting': 'Automatically adjust light color temperature and brightness based on time of day and sun position.',
    'powercalc': 'Virtual power sensors that estimate energy consumption for devices without built-in power monitoring.',

    // 3D printing & hardware
    'bambu_lab': 'Monitor and control Bambu Lab 3D printers with real-time status, camera feeds, and print job management.',

    // AI & vision
    'llmvision': 'Analyze camera images using AI vision models (GPT-4V, Claude) for object detection and scene understanding.',
    'extended_openai_conversation': 'Enhanced ChatGPT integration with function calling, context memory, and smart home control.',

    // Climate control
    'midea_ac_lan': 'Local control for Midea air conditioners without cloud dependency using LAN protocol.',
    'versatile_thermostat': 'Advanced virtual thermostat with multiple heating/cooling modes, presets, and sensor support.',

    // Energy & solar
    'anker_solix': 'Monitor Anker Solix solar generators and power stations with battery status and energy flow data.',

    // Utilities
    'waste_collection_schedule': 'Track garbage, recycling, and waste collection schedules with customizable calendar integration.',
    'battery_notes': 'Track battery types and replacement dates for all your battery-powered devices and sensors.',
    'browser_mod': 'Turn any browser into a controllable device with popup cards, navigation, and screen control.',

    // Security & monitoring
    'frigate': 'NVR with real-time AI object detection for security cameras using local processing.',

    // Advanced automation
    'pyscript': 'Write powerful automations in Python with full access to Home Assistant internals and state machine.',
    'spook': 'Advanced toolbox with hundreds of extra services, repairs, and debugging tools for power users.',
  };

  // Try exact category match first
  if (descriptions[category]) {
    return descriptions[category];
  }

  // Try name-based matching
  const nameKey = Object.keys(descriptions).find(key =>
    name.includes(key) || key.includes(name.replace(/\s+/g, '_'))
  );
  if (nameKey) {
    return descriptions[nameKey];
  }

  // Fallback: Generate from topics if available
  if (topics.length > 0) {
    const topicStr = topics.slice(0, 3).join(', ').replace(/-/g, ' ');
    return `Home Assistant integration for ${topicStr}.`;
  }

  // Final fallback: Generic description
  return `Home Assistant integration for ${opportunity.name}.`;
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

/**
 * KPI Calculations for Command Center
 */

export interface CommandCenterKPIs {
  totalOpportunities: number;
  avgDemandScore: number;
  trendingCount: number;
  highestOpportunity: { name: string; score: number } | null;
}

export function calculateKPIs(opportunities: Opportunity[]): CommandCenterKPIs {
  if (opportunities.length === 0) {
    return {
      totalOpportunities: 0,
      avgDemandScore: 0,
      trendingCount: 0,
      highestOpportunity: null,
    };
  }

  const totalDemand = opportunities.reduce((sum, opp) => sum + opp.scoring_details.demand, 0);
  const avgDemandScore = totalDemand / opportunities.length;

  const trendingCount = opportunities.filter(
    opp => opp.scoring_details.trend >= 70
  ).length;

  const highest = opportunities.reduce((max, opp) =>
    opp.score > max.score ? opp : max
  );

  return {
    totalOpportunities: opportunities.length,
    avgDemandScore,
    trendingCount,
    highestOpportunity: { name: highest.name, score: highest.score },
  };
}

/**
 * Insight Generation for Command Center
 */

export interface Insight {
  id: string;
  icon: string;
  text: string;
  opportunityId: string;
  type: 'hot' | 'rising' | 'warning' | 'info';
}

export function generateInsights(opportunities: Opportunity[]): Insight[] {
  const insights: Insight[] = [];

  // Top 5 opportunities for insights
  const topOpps = opportunities.slice(0, 5);

  topOpps.forEach((opp, index) => {
    const signals = calculateSignals(opp.scoring_details);

    // Hot opportunity (high demand + rising momentum)
    if (signals.demand === 'High' && signals.momentum === 'Rising') {
      insights.push({
        id: `insight-${opp.id}-hot`,
        icon: '🔥',
        text: `${opp.name} shows strong demand and rising momentum across all sources`,
        opportunityId: opp.id,
        type: 'hot',
      });
    }
    // Rising but flattening
    else if (signals.demand === 'High' && signals.momentum === 'Stable') {
      insights.push({
        id: `insight-${opp.id}-stable`,
        icon: '📈',
        text: `${opp.name} demand is high but trend momentum is flattening`,
        opportunityId: opp.id,
        type: 'info',
      });
    }
    // High demand but fading
    else if (signals.demand === 'High' && signals.momentum === 'Fading') {
      insights.push({
        id: `insight-${opp.id}-fading`,
        icon: '⚠️',
        text: `${opp.name} has near-max demand but limited growth signals`,
        opportunityId: opp.id,
        type: 'warning',
      });
    }
    // Rising star (medium demand but rising)
    else if (signals.demand === 'Med' && signals.momentum === 'Rising') {
      insights.push({
        id: `insight-${opp.id}-rising`,
        icon: '⭐',
        text: `${opp.name} is gaining momentum with steady demand growth`,
        opportunityId: opp.id,
        type: 'rising',
      });
    }
    // Solo-friendly opportunity
    else if (signals.buildability === 'Solo-friendly' && signals.demand !== 'Low') {
      insights.push({
        id: `insight-${opp.id}-solo`,
        icon: '🎯',
        text: `${opp.name} is highly feasible for solo builders with ${signals.demand.toLowerCase()} demand`,
        opportunityId: opp.id,
        type: 'info',
      });
    }
  });

  return insights.slice(0, 6); // Max 6 insights
}

