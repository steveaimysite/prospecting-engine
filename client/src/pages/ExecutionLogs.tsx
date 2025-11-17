import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function ExecutionLogs() {
  const { data: logs, isLoading } = trpc.prospecting.logs.useQuery({ limit: 100 });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'running':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Execution Logs</h1>
          <p className="text-muted-foreground mt-1">
            Detailed history of all prospecting runs
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        Execution #{log.id}
                      </CardTitle>
                      <CardDescription>
                        Started: {new Date(log.startedAt).toLocaleString()}
                        {log.completedAt && (
                          <> • Completed: {new Date(log.completedAt).toLocaleString()}</>
                        )}
                      </CardDescription>
                    </div>
                    <span className={getStatusBadge(log.status)}>
                      {log.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 mb-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Domains Found</p>
                      <p className="text-2xl font-bold">{log.domainsFound || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Emails Found</p>
                      <p className="text-2xl font-bold">{log.emailsFound || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Leads Posted</p>
                      <p className="text-2xl font-bold">{log.leadsPosted || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Triggered By</p>
                      <p className="text-sm capitalize">{log.triggeredBy}</p>
                    </div>

                    {log.searchQuery && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Search Query</p>
                        <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                          {log.searchQuery}
                        </p>
                      </div>
                    )}

                    {log.errorMessage && (
                      <div>
                        <p className="text-sm font-medium text-destructive">Error Message</p>
                        <p className="text-sm bg-destructive/10 text-destructive p-2 rounded mt-1">
                          {log.errorMessage}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                No execution logs yet. Run your first prospecting job from the Dashboard.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
