import { useState } from "react";
import { Copy, Trash, Check, Smartphone } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Key, Device, KeyStatus } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface KeyDetailsModalProps {
  keyId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Interface for key details with devices
interface KeyDetailsWithDevices extends Key {
  devices: Device[];
  status: KeyStatus;
}

export default function KeyDetailsModal({
  keyId,
  open,
  onOpenChange,
}: KeyDetailsModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Fetch key details
  const { data: keyDetails, isLoading } = useQuery<KeyDetailsWithDevices>({
    queryKey: [`/api/reseller/keys/${keyId}`],
    enabled: open && !!keyId,
  });

  // Remove device mutation
  const removeDeviceMutation = useMutation({
    mutationFn: async ({ keyId, deviceId }: { keyId: number; deviceId: string }) => {
      const response = await apiRequest(
        "POST",
        `/api/reseller/keys/${keyId}/devices/${deviceId}/remove`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reseller/keys/${keyId}`] });
      toast({
        title: "Success",
        description: "Device removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove device",
        variant: "destructive",
      });
    },
  });

  const handleCopyKey = () => {
    if (keyDetails?.keyString) {
      navigator.clipboard.writeText(keyDetails.keyString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "License key copied to clipboard",
      });
    }
  };

  const handleRemoveDevice = (deviceId: string) => {
    if (keyId) {
      removeDeviceMutation.mutate({ keyId, deviceId });
    }
  };

  const statusColor = keyDetails?.status 
    ? getStatusColor(keyDetails.status)
    : { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mobile-dialog-content">
        <div className="mobile-dialog-handle"></div>
        <DialogHeader>
          <DialogTitle>Key Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-purple-500 rounded-full"></div>
          </div>
        ) : keyDetails ? (
          <div className="p-4 space-y-5">
            {/* Key string with copy button */}
            <Card className="border-purple-500/20 bg-purple-900/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-purple-400">License Key</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyKey}
                    className="h-8 w-8 p-0 rounded-full text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <code className="font-mono text-xs sm:text-sm bg-black p-3 rounded-md block w-full overflow-x-auto border border-purple-500/20 text-purple-100">
                  {keyDetails.keyString}
                </code>
              </CardContent>
            </Card>
            
            {/* Key info grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-purple-500/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-purple-900/10 px-3 py-2 border-b border-purple-500/20">
                    <span className="text-xs text-purple-300">Game</span>
                  </div>
                  <div className="p-3">
                    <span className="text-sm font-medium">{keyDetails.game}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-500/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-purple-900/10 px-3 py-2 border-b border-purple-500/20">
                    <span className="text-xs text-purple-300">Status</span>
                  </div>
                  <div className="p-3">
                    <Badge 
                      variant="outline" 
                      className={`${statusColor.bg} ${statusColor.text} ${statusColor.border} text-xs`}
                    >
                      {keyDetails.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-500/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-purple-900/10 px-3 py-2 border-b border-purple-500/20">
                    <span className="text-xs text-purple-300">Created</span>
                  </div>
                  <div className="p-3">
                    <span className="text-sm">{formatDate(keyDetails.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-500/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-purple-900/10 px-3 py-2 border-b border-purple-500/20">
                    <span className="text-xs text-purple-300">Expires</span>
                  </div>
                  <div className="p-3">
                    <span className="text-sm">{formatDate(keyDetails.expiryDate)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Connected devices section */}
            <Card className="border-purple-500/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-purple-900/10 px-4 py-3 border-b border-purple-500/20 flex items-center">
                  <Smartphone className="h-4 w-4 mr-2 text-purple-400" /> 
                  <span className="text-sm font-medium text-purple-300">Connected Devices</span>
                </div>
                
                {keyDetails.devices && keyDetails.devices.length > 0 ? (
                  <div className="divide-y divide-purple-500/10">
                    {keyDetails.devices.map((device) => (
                      <div
                        key={device.id}
                        className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                      >
                        <div>
                          <span className="text-sm font-medium block">
                            {device.deviceId}
                          </span>
                          <span className="text-xs text-muted-foreground block mt-1">
                            Connected: {formatDate(device.firstConnected)}
                          </span>
                        </div>
                        {keyDetails.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs w-full sm:w-auto"
                            onClick={() => handleRemoveDevice(device.deviceId)}
                            disabled={removeDeviceMutation.isPending}
                          >
                            <Trash className="h-3.5 w-3.5 mr-1.5" /> Remove Device
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <p>No devices connected to this key yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            <p>Key details not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
