import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  if (insights.length === 0) {
    return null;
  }

  // Show top 2 insights when collapsed, all when expanded
  const displayedInsights = isExpanded ? insights : insights.slice(0, 2);

  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest">
          System Commentary
        </h3>
        {insights.length > 2 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-wide"
          >
            {isExpanded ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Show All ({insights.length})</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {displayedInsights.map((insight, index) => (
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

