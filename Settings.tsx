import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Settings() {
  const utils = trpc.useUtils();
  const { data: recipients, isLoading } = trpc.notifications.list.useQuery();
  const [newEmail, setNewEmail] = useState("");

  const addRecipient = trpc.notifications.add.useMutation({
    onSuccess: () => {
      toast.success("Email recipient added successfully");
      utils.notifications.list.invalidate();
      setNewEmail("");
    },
    onError: (error) => {
      toast.error(`Failed to add recipient: ${error.message}`);
    },
  });

  const toggleRecipient = trpc.notifications.toggle.useMutation({
    onSuccess: () => {
      toast.success("Recipient status updated");
      utils.notifications.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update recipient: ${error.message}`);
    },
  });

  const deleteRecipient = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      toast.success("Recipient deleted successfully");
      utils.notifications.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete recipient: ${error.message}`);
    },
  });

  const handleAddRecipient = () => {
    if (!newEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    addRecipient.mutate({ email: newEmail.trim() });
  };

  const handleToggle = (id: number, currentStatus: boolean) => {
    toggleRecipient.mutate({ id, isActive: !currentStatus });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this email recipient?")) {
      deleteRecipient.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure email notifications and other settings
          </p>
        </div>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Manage who receives daily prospecting reports and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Recipient */}
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRecipient();
                  }
                }}
              />
              <Button 
                onClick={handleAddRecipient}
                disabled={addRecipient.isPending}
              >
                {addRecipient.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </>
                )}
              </Button>
            </div>

            {/* Recipients List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : recipients && recipients.length > 0 ? (
              <div className="space-y-2">
                {recipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="flex items-center justify-between border rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggle(recipient.id, recipient.isActive)}
                        disabled={toggleRecipient.isPending}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {recipient.isActive ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <p className="font-medium">{recipient.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {recipient.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(recipient.id)}
                      disabled={deleteRecipient.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No email recipients configured. Add one above to receive notifications.
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Configuration Info */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              API keys are configured via environment variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Google Custom Search</span>
                <span className="text-muted-foreground">
                  {process.env.GOOGLE_API_KEY ? '✓ Configured' : '✗ Not configured'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Hunter.io API</span>
                <span className="text-muted-foreground">
                  {process.env.HUNTER_API_KEY ? '✓ Configured' : '✗ Not configured'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">ActiveCampaign API</span>
                <span className="text-muted-foreground">
                  {process.env.AC_API_URL && process.env.AC_API_TOKEN ? '✓ Configured' : '✗ Not configured'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                To update API keys, modify the environment variables in your deployment configuration.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Info */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Execution</CardTitle>
            <CardDescription>
              Automated prospecting runs daily at 7:00 AM GMT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium">Schedule</span>
                <span className="text-muted-foreground">Daily at 7:00 AM GMT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Target Leads</span>
                <span className="text-muted-foreground">100 per day</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                The scheduler runs automatically. You can also trigger manual runs from the Dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
