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