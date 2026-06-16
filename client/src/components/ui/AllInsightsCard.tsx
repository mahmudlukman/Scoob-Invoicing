import React from "react";
import { Lightbulb, AlertCircle, Sparkles, TrendingUp } from "lucide-react";
import { useGetDashboardSummaryQuery } from "../../redux/features/ai/aiApi";

const AIInsightsCard: React.FC = () => {
  const { data, isLoading, isError } = useGetDashboardSummaryQuery({});

  const insights = data?.insights || [];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.015)]">
      {/* Header Deck */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-amber-50 border border-amber-200/60 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Automated Business Intelligence
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              AI-driven predictive analysis and cash flow metrics
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider text-amber-700 bg-amber-50 border border-amber-100 uppercase">
          Live Analysis
        </span>
      </div>

      {/* State Machine Engine */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-5 h-5 bg-slate-100 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 bg-slate-100 rounded w-5/6" />
                <div className="h-2.5 bg-slate-50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-start space-x-3 text-xs text-red-600 bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <span className="font-bold block mb-0.5">
              Intelligence Engine Unreachable
            </span>
            <p className="text-slate-500 font-medium leading-relaxed">
              Failed to evaluate current transactional patterns. Please ensure
              ledger sync services are online.
            </p>
          </div>
        </div>
      ) : insights.length > 0 ? (
        <div className="divide-y divide-slate-50">
          {insights.map((insight: string, index: number) => (
            <div
              key={index}
              className="flex items-start space-x-3.5 py-3 first:pt-0 last:pb-0 group"
            >
              <div className="w-5 h-5 rounded-md bg-blue-50/60 border border-blue-100/50 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5 group-hover:bg-blue-50 transition-colors">
                <TrendingUp className="w-3 h-3" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pt-0.5">
                {insight}
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* Empty Dataset Frame */
        <div className="text-center py-8 max-w-sm mx-auto">
          <div className="w-12 h-12 mx-auto mb-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 mb-0.5">
            Awaiting Data Ingestion
          </h4>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            Generate and process client invoices to initialize pattern
            recognition profiles.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsightsCard;
