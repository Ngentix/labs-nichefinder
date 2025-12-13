import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  generateOpportunitySummary,
  calculateSignals,
  generateBuilderQuestions,
  generateRankingReasons,
  Insight,
} from '../../utils/opportunityHelpers';

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

interface OpportunityDrawerProps {
  opportunity: Opportunity;
  insights?: Insight[];
  onClose: () => void;
}

type Tab = 'overview' | 'intelligence' | 'evidence' | 'actions';

// Signal Meter Component - Large visual representation
function SignalMeter({
  label,
  value,
  momentum
}: {
  label: string;
  value: number;
  momentum?: 'Rising' | 'Stable' | 'Fading';
}) {
  const displayValue = value;
  const directionIcon = momentum === 'Rising' ? '↗' : momentum === 'Fading' ? '↘' : momentum === 'Stable' ? '→' : null;

  return (
    <div className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-4">
      <div className="text-[9px] uppercase tracking-widest text-gray-600 font-medium mb-3">
        {label}
      </div>
      <div className="flex items-end justify-between mb-3">
        <span className="text-2xl font-mono text-gray-100 font-bold">
          {displayValue.toFixed(0)}
        </span>
        {directionIcon && (
          <span className="text-lg text-gray-500 mb-1">{directionIcon}</span>
        )}
      </div>
      <div className="h-2 bg-gray-900/80 rounded-sm overflow-hidden">
        <div
          className="h-full bg-gray-300 transition-all duration-700 ease-out"
          style={{
            width: `${displayValue}%`,
            animation: `fillBar 0.7s ease-out forwards`
          }}
        />
      </div>
    </div>
  );
}

export function OpportunityDrawer({ opportunity, insights = [], onClose }: OpportunityDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const summary = generateOpportunitySummary(opportunity);
  const signals = calculateSignals(opportunity.scoring_details);
  const questions = generateBuilderQuestions(opportunity);
  const reasons = generateRankingReasons(opportunity);
  const opportunityInsights = insights.filter(i => i.opportunityId === opportunity.id);

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[700px] bg-gray-950 shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-950 border-b border-gray-800/50 p-6 z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-100 mb-2 tracking-tight">
                {opportunity.name}
              </h2>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                {opportunity.category.replace(/_/g, ' ')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Signal Overview - Large Visual Representations */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <SignalMeter
              label="Demand"
              value={opportunity.scoring_details.demand}
            />
            <SignalMeter
              label="Feasibility"
              value={opportunity.scoring_details.feasibility}
            />
            <SignalMeter
              label="Competition"
              value={100 - opportunity.scoring_details.competition}
            />
            <SignalMeter
              label="Trend"
              value={opportunity.scoring_details.trend}
              momentum={signals.momentum}
            />
          </div>

          {/* Composite Score - Prominent */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-gray-600 font-medium">
                Composite Score
              </span>
              <span className="text-3xl font-mono text-gray-100 font-bold">
                {opportunity.score.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Product Summary */}
          <p className="text-sm leading-relaxed text-gray-400 mb-6 border-l-2 border-gray-800/50 pl-4">
            {summary}
          </p>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-800/50">
            {[
              { id: 'overview' as Tab, label: 'Overview' },
              { id: 'intelligence' as Tab, label: 'Intelligence' },
              { id: 'evidence' as Tab, label: 'Evidence' },
              { id: 'actions' as Tab, label: 'Next Actions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs uppercase tracking-wide font-medium border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-gray-400 text-gray-100'
                  : 'border-transparent text-gray-600 hover:text-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab
              questions={questions}
              reasons={reasons}
              expandedQuestions={expandedQuestions}
              onToggleQuestion={toggleQuestion}
            />
          )}
          {activeTab === 'intelligence' && (
            <IntelligenceTab
              opportunity={opportunity}
              insights={opportunityInsights}
              signals={signals}
            />
          )}
          {activeTab === 'evidence' && (
            <EvidenceTab opportunity={opportunity} />
          )}
          {activeTab === 'actions' && (
            <ActionsTab opportunity={opportunity} />
          )}
        </div>
      </div>
    </>
  );
}

// Overview Tab Component
interface OverviewTabProps {
  questions: Array<{ question: string; answer: string; why: string }>;
  reasons: string[];
  expandedQuestions: Set<number>;
  onToggleQuestion: (index: number) => void;
}

function OverviewTab({ questions, reasons, expandedQuestions, onToggleQuestion }: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Why This Ranks Highly - Narrative Explanation */}
      <div>
        <h3 className="text-sm uppercase tracking-widest text-gray-600 font-medium mb-4">
          Why This Ranks Highly
        </h3>
        <div className="space-y-3">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed bg-gray-900/40 border border-gray-800/50 rounded-lg p-4"
            >
              <span className="text-gray-600 font-mono text-xs mt-0.5">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Builder Questions */}
      <div>
        <h3 className="text-sm uppercase tracking-widest text-gray-600 font-medium mb-4">
          Builder Questions
        </h3>
        <div className="space-y-3">
          {questions.map((q, index) => (
            <div
              key={index}
              className="border border-gray-800/50 rounded-lg overflow-hidden bg-gray-900/40"
            >
              <button
                onClick={() => onToggleQuestion(index)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <div className="text-left flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {q.question}
                  </p>
                  <p className="text-sm text-gray-100 font-semibold">
                    {q.answer}
                  </p>
                </div>
                {expandedQuestions.has(index) ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0 ml-2" />
                )}
              </button>
              {expandedQuestions.has(index) && (
                <div className="px-4 py-3 bg-gray-950/60 border-t border-gray-800/50">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    <span className="font-medium text-gray-500">Why?</span> {q.why}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Evidence Tab Component
interface EvidenceTabProps {
  opportunity: Opportunity;
}

function EvidenceTab({ opportunity }: EvidenceTabProps) {
  const hacsSource = opportunity.data_sources.find(ds => ds.source_type === 'hacs');
  const githubSource = opportunity.data_sources.find(ds => ds.source_type === 'git_hub');
  const youtubeSource = opportunity.data_sources.find(ds =>
    ds.source_type === 'youtube' || (typeof ds.source_type === 'object' && 'other' in ds.source_type)
  );

  return (
    <div className="space-y-6">
      {/* Data Sources Summary - Visual Counts */}
      <div className="grid grid-cols-3 gap-4">
        {hacsSource && (
          <div className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-4">
            <div className="text-[9px] uppercase tracking-widest text-gray-600 font-medium mb-2">
              HACS
            </div>
            <div className="text-2xl font-mono text-gray-100 font-bold">
              {hacsSource.data_points}
            </div>
            <div className="text-xs text-gray-500 mt-1">data points</div>
          </div>
        )}
        {githubSource && (
          <div className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-4">
            <div className="text-[9px] uppercase tracking-widest text-gray-600 font-medium mb-2">
              GitHub
            </div>
            <div className="text-2xl font-mono text-gray-100 font-bold">
              {githubSource.metadata?.stars?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1">stars</div>
          </div>
        )}
        {youtubeSource && (
          <div className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-4">
            <div className="text-[9px] uppercase tracking-widest text-gray-600 font-medium mb-2">
              YouTube
            </div>
            <div className="text-2xl font-mono text-gray-100 font-bold">
              {youtubeSource.data_points}
            </div>
            <div className="text-xs text-gray-500 mt-1">videos</div>
          </div>
        )}
      </div>

      {/* HACS Card */}
      {hacsSource && (
        <div className="border border-gray-800/50 rounded-lg p-4 bg-gray-900/40">
          <h3 className="text-sm uppercase tracking-widest text-gray-600 font-medium mb-4">
            HACS Integration
          </h3>
          <dl className="space-y-3">
            {hacsSource.metadata?.domain && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Domain:</dt>
                <dd className="text-gray-100 font-medium font-mono">
                  {hacsSource.metadata.domain}
                </dd>
              </div>
            )}
            {hacsSource.metadata?.downloads !== undefined && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Downloads:</dt>
                <dd className="text-gray-100 font-medium font-mono">
                  {hacsSource.metadata.downloads.toLocaleString()}
                </dd>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Data Points:</dt>
              <dd className="text-gray-100 font-medium font-mono">
                {hacsSource.data_points}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* GitHub Card */}
      {githubSource && (
        <div className="border border-gray-800/50 rounded-lg p-4 bg-gray-900/40">
          <h3 className="text-sm uppercase tracking-widest text-gray-600 font-medium mb-4">
            GitHub Repository
          </h3>
          <dl className="space-y-3">
            {githubSource.metadata?.full_name && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Repository:</dt>
                <dd className="text-gray-100 font-medium font-mono text-xs">
                  {githubSource.metadata.full_name}
                </dd>
              </div>
            )}
            {githubSource.metadata?.stars !== undefined && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Stars:</dt>
                <dd className="text-gray-100 font-medium font-mono">
                  {githubSource.metadata.stars.toLocaleString()}
                </dd>
              </div>
            )}
            {githubSource.metadata?.forks !== undefined && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Forks:</dt>
                <dd className="text-gray-100 font-medium font-mono">
                  {githubSource.metadata.forks.toLocaleString()}
                </dd>
              </div>
            )}
            {githubSource.metadata?.open_issues !== undefined && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Open Issues:</dt>
                <dd className="text-gray-100 font-medium font-mono">
                  {githubSource.metadata.open_issues}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* YouTube Card */}
      {youtubeSource && (
        <div className="border border-gray-800/50 rounded-lg p-4 bg-gray-900/40">
          <h3 className="text-sm uppercase tracking-widest text-gray-600 font-medium mb-4">
            YouTube Mentions
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Videos Found:</dt>
              <dd className="text-gray-100 font-medium font-mono">
                {youtubeSource.data_points}
              </dd>
            </div>
            {youtubeSource.metadata?.match_type && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Match Type:</dt>
                <dd className="text-gray-100 font-medium font-mono">
                  {youtubeSource.metadata.match_type}
                </dd>
              </div>
            )}
            {youtubeSource.metadata?.note && (
              <div className="text-sm text-gray-400 mt-2 leading-relaxed">
                {youtubeSource.metadata.note}
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

// Actions Tab Component
interface ActionsTabProps {
  opportunity: Opportunity;
}

function ActionsTab({ opportunity }: ActionsTabProps) {
  const githubSource = opportunity.data_sources.find(ds => ds.source_type === 'git_hub');
  const openIssues = githubSource?.metadata?.open_issues || 0;
  const stars = githubSource?.metadata?.stars || 0;

  const actions = [
    {
      title: 'Contribute / Maintain',
      description: openIssues > 10
        ? `${openIssues} open issues suggest maintenance opportunities`
        : 'Stable project with room for enhancements',
      steps: [
        'Review open issues and PRs',
        'Identify quick wins or documentation gaps',
        'Submit quality contributions to build reputation',
      ],
    },
    {
      title: 'Differentiate / Extend',
      description: 'Build complementary tools or enhanced versions',
      steps: [
        'Analyze feature gaps in existing solution',
        'Survey user feedback and feature requests',
        'Build focused extension or alternative approach',
      ],
    },
    {
      title: 'Monetize',
      description: stars > 500
        ? 'Significant user base suggests monetization potential'
        : 'Niche opportunity for specialized services',
      steps: [
        'Offer premium support or consulting',
        'Create training content or courses',
        'Build SaaS wrapper for non-technical users',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400 mb-6 leading-relaxed">
        Potential paths forward based on opportunity characteristics
      </p>
      {actions.map((action, index) => (
        <div
          key={index}
          className="border border-gray-800/50 rounded-lg p-5 bg-gray-900/40 hover:border-gray-700/50 transition-colors"
        >
          <h3 className="text-base font-semibold text-gray-100 mb-2 tracking-tight">
            {action.title}
          </h3>
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            {action.description}
          </p>
          <ul className="space-y-2">
            {action.steps.map((step, stepIndex) => (
              <li
                key={stepIndex}
                className="flex items-start gap-3 text-sm text-gray-300"
              >
                <span className="text-gray-600 font-mono text-xs mt-0.5">
                  {(stepIndex + 1).toString().padStart(2, '0')}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// Intelligence Tab Component
interface IntelligenceTabProps {
  opportunity: Opportunity;
  insights: Insight[];
  signals: {
    demand: 'High' | 'Med' | 'Low';
    momentum: 'Rising' | 'Stable' | 'Fading';
    buildability: 'Solo-friendly' | 'Complex' | 'Hard';
  };
}

// Insight type styles for intelligence breakdown
const insightTypeStyles = {
  hot: 'bg-red-500/10 border-red-500/30 text-red-300',
  rising: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
  info: 'bg-gray-500/10 border-gray-600/30 text-gray-300',
};

function IntelligenceTab({ opportunity, insights, signals }: IntelligenceTabProps) {
  // Group insights by theme
  const demandInsights = insights.filter(i => i.type === 'hot' || i.text.toLowerCase().includes('demand'));
  const momentumInsights = insights.filter(i => i.type === 'rising' || i.text.toLowerCase().includes('momentum') || i.text.toLowerCase().includes('rising'));
  const riskInsights = insights.filter(i => i.type === 'warning' || i.text.toLowerCase().includes('saturation') || i.text.toLowerCase().includes('competition'));
  const otherInsights = insights.filter(i =>
    !demandInsights.includes(i) &&
    !momentumInsights.includes(i) &&
    !riskInsights.includes(i)
  );

  return (
    <div className="space-y-8">
      {/* Signal Recap */}
      <div>
        <h3 className="text-sm uppercase tracking-widest text-gray-600 font-medium mb-4">
          Signal Recap
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-4">
            <div className="text-[9px] uppercase tracking-widest text-gray-600 font-medium mb-2">
              Demand
            </div>
            <div className="text-lg font-bold text-gray-100">{signals.demand}</div>
          </div>
          <div className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-4">
            <div className="text-[9px] uppercase tracking-widest text-gray-600 font-medium mb-2">
              Momentum
            </div>
            <div className="text-lg font-bold text-gray-100">{signals.momentum}</div>
          </div>
          <div className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-4">
            <div className="text-[9px] uppercase tracking-widest text-gray-600 font-medium mb-2">
              Buildability
            </div>
            <div className="text-lg font-bold text-gray-100">{signals.buildability}</div>
          </div>
        </div>
      </div>

      {/* Intelligence Breakdown */}
      {insights.length > 0 ? (
        <>
          {/* Demand Insights */}
          {demandInsights.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-widest text-gray-600 font-medium mb-4">
                Demand Analysis
              </h3>
              <div className="space-y-3">
                {demandInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`border rounded-lg p-4 ${insightTypeStyles[insight.type]}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{insight.icon}</span>
                      <p className="text-sm leading-relaxed font-light">
                        {insight.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Momentum Insights */}
          {momentumInsights.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-widest text-gray-600 font-medium mb-4">
                Momentum Analysis
              </h3>
              <div className="space-y-3">
                {momentumInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`border rounded-lg p-4 ${insightTypeStyles[insight.type]}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{insight.icon}</span>
                      <p className="text-sm leading-relaxed font-light">
                        {insight.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk/Saturation Insights */}
          {riskInsights.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-widest text-gray-600 font-medium mb-4">
                Risk & Saturation
              </h3>
              <div className="space-y-3">
                {riskInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`border rounded-lg p-4 ${insightTypeStyles[insight.type]}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{insight.icon}</span>
                      <p className="text-sm leading-relaxed font-light">
                        {insight.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Insights */}
          {otherInsights.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-widest text-gray-600 font-medium mb-4">
                Additional Intelligence
              </h3>
              <div className="space-y-3">
                {otherInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`border rounded-lg p-4 ${insightTypeStyles[insight.type]}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{insight.icon}</span>
                      <p className="text-sm leading-relaxed font-light">
                        {insight.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Evidence */}
          <div>
            <h3 className="text-sm uppercase tracking-widest text-gray-600 font-medium mb-4">
              Supporting Evidence
            </h3>
            <div className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Intelligence insights are derived from cross-source signal analysis:
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                {opportunity.data_sources.map((source, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-600 mt-0.5">•</span>
                    <span>
                      <span className="font-medium text-gray-200">{source.name}</span>
                      {' '}({source.source_type}) — {source.data_points} data points
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            No intelligence insights available for this opportunity yet.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Intelligence is generated for top-ranked opportunities with strong signals.
          </p>
        </div>
      )}
    </div>
  );
}

