import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowDown, ArrowUp, TrendingUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function IcpAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const analysisMutation = trpc.icpAnalytics.analyze.useMutation({
    onSuccess: (data) => {
      setAnalysisData(data);
      setIsAnalyzing(false);
      toast.success("ICP analysis completed successfully");
    },
    onError: (error: any) => {
      setIsAnalyzing(false);
      toast.error(`Analysis failed: ${error.message}`);
    },
  });

  const applyRecommendationsMutation = trpc.icp.applyRecommendations.useMutation({
    onSuccess: () => {
      toast.success("ICP weights updated based on recommendations");
      // Refresh analysis after applying
      handleRunAnalysis();
    },
    onError: (error: any) => {
      toast.error(`Failed to apply recommendations: ${error.message}`);
    },
  });

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    analysisMutation.mutate();
  };

  const handleApplyRecommendations = () => {
    if (!analysisData?.attributePerformance) {
      toast.error("No recommendations available");
      return;
    }

    const recommendations = analysisData.attributePerformance
      .filter((attr: any) => attr.recommendation !== 'maintain')
      .map((attr: any) => ({
        attribute: attr.attribute,
        value: attr.value,
        newWeight: attr.suggestedWeight,
      }));

    if (recommendations.length === 0) {
      toast.info("No weight changes recommended");
      return;
    }

    applyRecommendationsMutation.mutate({ recommendations });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access ICP Analytics</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">ICP Analytics</h1>
            <p className="text-slate-600 mt-2">
              AI-powered insights from ActiveCampaign engagement data
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
            {analysisData && (
              <Button
                onClick={handleApplyRecommendations}
                disabled={applyRecommendationsMutation.isPending}
                size="lg"
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                {applyRecommendationsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Apply Recommendations
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {!analysisData && !isAnalyzing && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <TrendingUp className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No Analysis Data Yet
              </h3>
              <p className="text-slate-500 text-center max-w-md mb-6">
                Run an analysis to see how your ICP attributes are performing based on
                ActiveCampaign engagement metrics
              </p>
              <Button onClick={handleRunAnalysis} size="lg">
                <TrendingUp className="mr-2 h-4 w-4" />
                Run First Analysis
              </Button>
            </CardContent>
          </Card>
        )}

        {analysisData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Leads Analyzed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">
                    {analysisData.totalLeads}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    From ActiveCampaign Prospects list
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Average Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">
                    {analysisData.avgEngagement.toFixed(1)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Contact score from 0-100
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">
                    {analysisData.recommendations.length}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    AI-powered optimization suggestions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers */}
            {analysisData.topPerformers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Top Performing ICP Attributes
                  </CardTitle>
                  <CardDescription>
                    These attributes generate the highest engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.topPerformers.slice(0, 5).map((perf: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {perf.attribute}: {perf.value}
                            </div>
                            <div className="text-sm text-slate-600">
                              {perf.leadsGenerated} leads generated
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {perf.avgEngagement.toFixed(1)}
                          </div>
                          <div className="text-xs text-slate-500">engagement</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Underperformers */}
            {analysisData.underperformers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Underperforming ICP Attributes
                  </CardTitle>
                  <CardDescription>
                    Consider reducing weights or removing these attributes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.underperformers.slice(0, 5).map((perf: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-orange-600 text-white rounded-full font-bold">
                            !
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {perf.attribute}: {perf.value}
                            </div>
                            <div className="text-sm text-slate-600">
                              {perf.leadsGenerated} leads generated
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-600">
                            {perf.avgEngagement.toFixed(1)}
                          </div>
                          <div className="text-xs text-slate-500">engagement</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Attribute Performance */}
            <Card>
              <CardHeader>
                <CardTitle>All ICP Attribute Performance</CardTitle>
                <CardDescription>
                  Detailed breakdown with recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisData.attributePerformance.map((attr: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">
                          {attr.attribute}: {attr.value}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {attr.leadsGenerated} leads · Engagement: {attr.avgEngagement.toFixed(1)}
                        </div>
                        {attr.reason && (
                          <div className="text-xs text-slate-500 mt-1 italic">
                            {attr.reason}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-600">
                            Current: {attr.currentWeight}
                          </div>
                          {attr.recommendation !== 'maintain' && (
                            <div className="text-sm font-semibold text-blue-600">
                              Suggested: {attr.suggestedWeight}
                            </div>
                          )}
                        </div>
                        {attr.recommendation === 'increase' && (
                          <ArrowUp className="h-5 w-5 text-green-600" />
                        )}
                        {attr.recommendation === 'decrease' && (
                          <ArrowDown className="h-5 w-5 text-orange-600" />
                        )}
                        {attr.recommendation === 'maintain' && (
                          <div className="text-slate-400 text-sm">—</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            {analysisData.recommendations.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <TrendingUp className="h-5 w-5" />
                    AI-Powered Recommendations
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Actionable insights to optimize your ICP
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.recommendations.map((rec: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm text-slate-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
