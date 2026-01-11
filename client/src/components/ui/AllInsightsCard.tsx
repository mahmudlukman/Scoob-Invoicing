import React from "react";
import { Lightbulb, AlertCircle } from "lucide-react";
import { useGetDashboardSummaryQuery } from "../../redux/features/ai/aiApi";

const AIInsightsCard: React.FC = () => {
  const { data, isLoading, isError } = useGetDashboardSummaryQuery({});

  const insights = data?.insights || [];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm shadow-gray-100">
      <div className="flex items-center mb-4">
        <Lightbulb className="w-6 h-6 text-yellow-500 mr-3" />
        <h3 className="text-lg font-semibold text-slate-900">AI Insights</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      ) : isError ? (
        <div className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>Failed to load AI insights. Please try again later.</p>
        </div>
      ) : insights.length > 0 ? (
        <ul className="space-y-3 list-disc list-inside text-slate-600 ml-3">
          {insights.map((insight: string, index: number) => (
            <li key={index} className="text-sm leading-relaxed">
              {insight}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-6 text-slate-500">
          <Lightbulb className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">No insights available yet.</p>
          <p className="text-xs mt-1">
            Create some invoices to get AI-powered insights.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsightsCard;
