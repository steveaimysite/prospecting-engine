import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Play, TrendingUp, Mail, Database, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { data: logs, isLoading: logsLoading } = trpc.prospecting.logs.useQuery({ limit: 10 });
  const { data: totalLeadsCount } = trpc.leads.count.useQuery();
  const runProspecting = trpc.prospecting.run.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Prospecting completed! Posted ${result.leadsPosted} leads to ActiveCampaign.`);
      } else {
        toast.error(`Prospecting failed: ${result.error}`);
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const latestLog = logs?.[0];
  const stats = {
    totalRuns: logs?.length || 0,
    successfulRuns: logs?.filter(log => log.status === 'completed').length || 0,
    totalLeads: totalLeadsCount || 0,
    lastRun: latestLog?.startedAt ? new Date(latestLog.startedAt).toLocaleString() : 'Never',
  };

  const { data: icpData } = trpc.icp.list.useQuery();

  const handleRunProspecting = () => {
    // Check if ICP data exists
    if (!icpData || icpData.length === 0) {
      toast.error('No ICP data found. Please sync from Google Sheets in ICP Management first.');
      return;
    }

    if (confirm('Start prospecting run now? This will search for leads and post them to ActiveCampaign.')) {
      runProspecting.mutate({ targetLeads: 100 });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Prospecting Engine</h1>
            <p className="text-muted-foreground mt-1">
              Automated lead generation for goaimysite.com
            </p>
          </div>
          <Button 
            onClick={handleRunProspecting} 
            disabled={runProspecting.isPending}
            size="lg"
          >
            {runProspecting.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Now
              </>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRuns}</div>
              <p className="text-xs text-muted-foreground">
                {stats.successfulRuns} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                Unique leads tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Run</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{stats.lastRun}</div>
              <p className="text-xs text-muted-foreground">
                {latestLog?.status || 'No runs yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Result</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestLog?.leadsPosted || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                leads from last run
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
            <CardDescription>
              Latest prospecting runs and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : logs && logs.length > 0 ? (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {new Date(log.startedAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Triggered by: {log.triggeredBy}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            log.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : log.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {log.domainsFound || 0} domains • {log.emailsFound || 0} emails • {log.leadsPosted || 0} posted
                      </p>
                      {log.errorMessage && (
                        <p className="text-xs text-destructive mt-1">
                          Error: {log.errorMessage.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No execution logs yet. Click "Run Now" to start your first prospecting run.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
