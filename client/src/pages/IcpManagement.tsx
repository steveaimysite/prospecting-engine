import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, RefreshCw, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SHEET_ID = "1EHMijNDykLjmRLmU5MCxik6Hhr9Kpf2m8cRR-U-99P8";

export default function IcpManagement() {
  const utils = trpc.useUtils();
  const { data: icpData, isLoading } = trpc.icp.list.useQuery();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const { data: previewData } = trpc.icp.previewQuery.useQuery();

  const syncMutation = trpc.icp.sync.useMutation({
    onSuccess: () => {
      toast.success("ICP data synced successfully from Google Sheets");
      utils.icp.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  const updateWeightMutation = trpc.icp.updateWeight.useMutation({
    onSuccess: () => {
      toast.success("Weight updated successfully");
      utils.icp.list.invalidate();
      setEditingId(null);
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });

  const deleteMutation = trpc.icp.delete.useMutation({
    onSuccess: () => {
      toast.success("Item deleted successfully");
      utils.icp.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  const handleSync = () => {
    if (confirm("Sync ICP data from Google Sheets? This will replace all current data.")) {
      syncMutation.mutate({ sheetId: SHEET_ID });
    }
  };

  const handleUpdateWeight = (id: number) => {
    const weight = parseFloat(editWeight);
    if (isNaN(weight) || weight < 0 || weight > 1) {
      toast.error("Weight must be between 0 and 1");
      return;
    }
    updateWeightMutation.mutate({ id, weight: weight.toFixed(2) });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this ICP data item?")) {
      deleteMutation.mutate({ id });
    }
  };

  const startEdit = (id: number, currentWeight: string) => {
    setEditingId(id);
    setEditWeight(currentWeight);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditWeight("");
  };

  // Group data by attribute
  const groupedData = icpData?.reduce((acc, item) => {
    if (!acc[item.attribute]) {
      acc[item.attribute] = [];
    }
    acc[item.attribute].push(item);
    return acc;
  }, {} as Record<string, typeof icpData>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ICP Data Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage Ideal Customer Profile attributes and weights
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowPreview(true)} 
              disabled={!icpData || icpData.length === 0}
              variant="outline"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview Search Query
            </Button>
            <Button 
              onClick={handleSync} 
              disabled={syncMutation.isPending}
              variant="outline"
            >
              {syncMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync from Google Sheets
                </>
              )}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : icpData && icpData.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedData || {}).map(([attribute, items]) => (
              <Card key={attribute}>
                <CardHeader>
                  <CardTitle className="capitalize">{attribute.replace('_', ' ')}</CardTitle>
                  <CardDescription>
                    {items.length} value{items.length !== 1 ? 's' : ''} configured
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border rounded-lg p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.value}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {editingId === item.id ? (
                            <>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={editWeight}
                                onChange={(e) => setEditWeight(e.target.value)}
                                className="w-24"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleUpdateWeight(item.id)}
                                disabled={updateWeightMutation.isPending}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(item.id, item.weight)}
                                className="text-sm font-mono bg-muted px-3 py-1 rounded hover:bg-muted/80"
                              >
                                {item.weight}
                              </button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(item.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No ICP data found. Click "Sync from Google Sheets" to import your data.
              </p>
              <Button onClick={handleSync} disabled={syncMutation.isPending}>
                {syncMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync from Google Sheets
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search Query Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Google Search Query Preview</DialogTitle>
            <DialogDescription>
              This is the exact query that will be used to search for domains based on your current ICP weights.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewData?.error ? (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                {previewData.error}
              </div>
            ) : (
              <>
                <div className="p-4 bg-muted rounded-lg font-mono text-sm break-words">
                  {previewData?.query || 'Loading...'}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">How to read this query:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Values in parentheses with OR are alternatives within the same attribute</li>
                    <li>AND connects different attribute groups - all must match</li>
                    <li>Quotes ensure exact phrase matching</li>
                    <li>Higher weighted values appear first in each group</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
