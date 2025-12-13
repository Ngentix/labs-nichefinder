import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  generateOpportunitySummary,
  calculateSignals,
  generateBuilderQuestions,
  generateRankingReasons,
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
  onClose: () => void;
}

type Tab = 'overview' | 'evidence' | 'actions';

export function OpportunityDrawer({ opportunity, onClose }: OpportunityDrawerProps) {
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
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {opportunity.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {opportunity.category}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Score and Signals */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
              Score: {opportunity.score.toFixed(1)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${signals.demand === 'High' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                signals.demand === 'Med' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
              Demand: {signals.demand}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${signals.momentum === 'Rising' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                signals.momentum === 'Stable' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
              Momentum: {signals.momentum}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${signals.buildability === 'Solo-friendly' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                signals.buildability === 'Complex' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
              Build: {signals.buildability}
            </span>
          </div>

          {/* Summary */}
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {summary}
          </p>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview' as Tab, label: 'Overview' },
              { id: 'evidence' as Tab, label: 'Evidence' },
              { id: 'actions' as Tab, label: 'Next Actions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
    <div className="space-y-6">
      {/* Builder Questions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Builder Questions
        </h3>
        <div className="space-y-3">
          {questions.map((q, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => onToggleQuestion(index)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {q.question}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white font-semibold mt-1">
                    {q.answer}
                  </p>
                </div>
                {expandedQuestions.has(index) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                )}
              </button>
              {expandedQuestions.has(index) && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Why?</span> {q.why}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Why This Ranks Highly */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Why This Ranks Highly
        </h3>
        <ul className="space-y-2">
          {reasons.map((reason, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="text-blue-500 mt-1">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
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
      {/* HACS Card */}
      {hacsSource && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            HACS Integration
          </h3>
          <dl className="space-y-2">
            {hacsSource.metadata?.domain && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600 dark:text-gray-400">Domain:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {hacsSource.metadata.domain}
                </dd>
              </div>
            )}
            {hacsSource.metadata?.downloads !== undefined && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600 dark:text-gray-400">Downloads:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {hacsSource.metadata.downloads.toLocaleString()}
                </dd>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600 dark:text-gray-400">Data Points:</dt>
              <dd className="text-gray-900 dark:text-white font-medium">
                {hacsSource.data_points}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* GitHub Card */}
      {githubSource && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            GitHub Repository
          </h3>
          <dl className="space-y-2">
            {githubSource.metadata?.full_name && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600 dark:text-gray-400">Repository:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {githubSource.metadata.full_name}
                </dd>
              </div>
            )}
            {githubSource.metadata?.stars !== undefined && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600 dark:text-gray-400">Stars:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {githubSource.metadata.stars.toLocaleString()}
                </dd>
              </div>
            )}
            {githubSource.metadata?.forks !== undefined && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600 dark:text-gray-400">Forks:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {githubSource.metadata.forks.toLocaleString()}
                </dd>
              </div>
            )}
            {githubSource.metadata?.open_issues !== undefined && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600 dark:text-gray-400">Open Issues:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {githubSource.metadata.open_issues}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* YouTube Card */}
      {youtubeSource && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            YouTube Mentions
          </h3>
          <dl className="space-y-2">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600 dark:text-gray-400">Videos Found:</dt>
              <dd className="text-gray-900 dark:text-white font-medium">
                {youtubeSource.data_points}
              </dd>
            </div>
            {youtubeSource.metadata?.match_type && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600 dark:text-gray-400">Match Type:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {youtubeSource.metadata.match_type}
                </dd>
              </div>
            )}
            {youtubeSource.metadata?.note && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
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
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Potential paths forward based on opportunity characteristics
      </p>
      {actions.map((action, index) => (
        <div
          key={index}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {action.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {action.description}
          </p>
          <ul className="space-y-1">
            {action.steps.map((step, stepIndex) => (
              <li
                key={stepIndex}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="text-blue-500 mt-1">{stepIndex + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

