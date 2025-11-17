import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Play, StopCircle, Trophy, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AbTesting() {
  const { user, loading: authLoading } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [testName, setTestName] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [variantAName, setVariantAName] = useState("Control");
  const [variantBName, setVariantBName] = useState("Variant B");

  const { data: tests, isLoading, refetch } = trpc.abTest.list.useQuery();

  const createTestMutation = trpc.abTest.create.useMutation({
    onSuccess: () => {
      toast.success("A/B test created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to create test: ${error.message}`);
    },
  });

  const startTestMutation = trpc.abTest.start.useMutation({
    onSuccess: () => {
      toast.success("A/B test started");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to start test: ${error.message}`);
    },
  });

  const stopTestMutation = trpc.abTest.stop.useMutation({
    onSuccess: () => {
      toast.success("A/B test stopped");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to stop test: ${error.message}`);
    },
  });

  const resetForm = () => {
    setTestName("");
    setTestDescription("");
    setVariantAName("Control");
    setVariantBName("Variant B");
  };

  const handleCreateTest = () => {
    if (!testName.trim()) {
      toast.error("Please enter a test name");
      return;
    }

    createTestMutation.mutate({
      name: testName,
      description: testDescription,
      variantAName,
      variantBName,
    });
  };

  if (authLoading || isLoading) {
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
            <CardDescription>Please log in to access A/B Testing</CardDescription>
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
            <h1 className="text-4xl font-bold text-slate-900">A/B Testing</h1>
            <p className="text-slate-600 mt-2">
              Test different ICP configurations and find the best-performing variant
            </p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Test
          </Button>
        </div>

        {/* Tests List */}
        {!tests || tests.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <TrendingUp className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No A/B Tests Yet
              </h3>
              <p className="text-slate-500 text-center max-w-md mb-6">
                Create your first A/B test to compare different ICP configurations and
                discover which targeting strategy generates the best engagement
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create First Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tests.map((test: any) => (
              <Card key={test.id} className="overflow-hidden">
                <CardHeader className={`${
                  test.status === 'running' ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
                  test.status === 'completed' ? 'bg-gradient-to-r from-blue-50 to-indigo-50' :
                  'bg-slate-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{test.name}</CardTitle>
                      {test.description && (
                        <CardDescription className="mt-2">{test.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        test.status === 'running' ? 'bg-green-600 text-white' :
                        test.status === 'completed' ? 'bg-blue-600 text-white' :
                        test.status === 'cancelled' ? 'bg-slate-400 text-white' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {test.status.toUpperCase()}
                      </span>
                      {test.status === 'draft' && (
                        <Button
                          onClick={() => startTestMutation.mutate({ testId: test.id })}
                          disabled={startTestMutation.isPending}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Start
                        </Button>
                      )}
                      {test.status === 'running' && (
                        <Button
                          onClick={() => stopTestMutation.mutate({ testId: test.id })}
                          disabled={stopTestMutation.isPending}
                          size="sm"
                          variant="outline"
                          className="border-orange-600 text-orange-600"
                        >
                          <StopCircle className="mr-1 h-3 w-3" />
                          Stop
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {test.variants.map((variant: any, index: number) => (
                      <div
                        key={variant.id}
                        className={`p-6 rounded-lg border-2 ${
                          test.winningVariantId === variant.id
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {variant.name}
                          </h3>
                          {test.winningVariantId === variant.id && (
                            <Trophy className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Executions</span>
                            <span className="font-semibold text-slate-900">
                              {variant.executionCount}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Total Leads</span>
                            <span className="font-semibold text-slate-900">
                              {variant.totalLeads}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Avg Engagement</span>
                            <span className="font-semibold text-slate-900">
                              {parseFloat(variant.avgEngagement).toFixed(1)}
                            </span>
                          </div>
                          {variant.executionCount > 0 && (
                            <div className="flex justify-between items-center pt-2 border-t">
                              <span className="text-sm text-slate-600">Leads per Run</span>
                              <span className="font-semibold text-blue-600">
                                {(variant.totalLeads / variant.executionCount).toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {test.status === 'completed' && test.winningVariantId && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-900 font-semibold mb-2">
                        <Trophy className="h-5 w-5" />
                        Winner Declared
                      </div>
                      <p className="text-sm text-yellow-800">
                        {test.variants.find((v: any) => v.id === test.winningVariantId)?.name} performed best with{' '}
                        {parseFloat(test.variants.find((v: any) => v.id === test.winningVariantId)?.avgEngagement || 0).toFixed(1)}{' '}
                        average engagement score.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Test Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New A/B Test</DialogTitle>
              <DialogDescription>
                Set up a new test to compare different ICP configurations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="test-name">Test Name</Label>
                <Input
                  id="test-name"
                  placeholder="e.g., SaaS vs Enterprise Focus"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-description">Description (Optional)</Label>
                <Textarea
                  id="test-description"
                  placeholder="Describe what you're testing..."
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variant-a">Variant A Name</Label>
                  <Input
                    id="variant-a"
                    placeholder="Control"
                    value={variantAName}
                    onChange={(e) => setVariantAName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variant-b">Variant B Name</Label>
                  <Input
                    id="variant-b"
                    placeholder="Variant B"
                    value={variantBName}
                    onChange={(e) => setVariantBName(e.target.value)}
                  />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>Note:</strong> Both variants will use your current ICP configuration.
                After creating the test, you can modify weights for each variant in ICP Management.
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTest}
                disabled={createTestMutation.isPending}
              >
                {createTestMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Test
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
