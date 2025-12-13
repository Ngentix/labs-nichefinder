import { Insight } from '../../utils/opportunityHelpers';

interface InsightFeedProps {
  insights: Insight[];
  onInsightClick?: (opportunityId: string) => void;
}

// Cinematic insight styles - dark, high-contrast
const insightTypeStyles = {
  hot: 'bg-red-500/5 border-red-500/20 hover:border-red-500/30',
  rising: 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/30',
  warning: 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/30',
  info: 'bg-gray-500/5 border-gray-700/30 hover:border-gray-600/40',
};

export function InsightFeed({ insights, onInsightClick }: InsightFeedProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-5">
        Intelligence Feed
      </h3>
      <div className="space-y-2.5">
        {insights.map((insight, index) => (
          <div
            key={insight.id}
            className={`border rounded-lg p-4 transition-all duration-500 bg-gray-900/30 backdrop-blur-sm ${insightTypeStyles[insight.type]
              } ${onInsightClick ? 'cursor-pointer' : ''}`}
            style={{
              animation: `fadeIn 0.6s ease-out ${index * 120 + 700}ms both`,
              boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.03)',
            }}
            onClick={() => onInsightClick?.(insight.opportunityId)}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 opacity-80">{insight.icon}</span>
              <p className="text-sm text-gray-300 leading-relaxed font-light">
                {insight.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

