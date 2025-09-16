import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/layouts/admin-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, getStatusColor } from "@/lib/utils";
import {
  ArrowLeft,
  Trash2,
  Shield,
  Calendar,
  Clock,
  Smartphone,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ResellerKeys() {
  const [match, params] = useRoute("/admin/resellers/:id/keys");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [reseller, setReseller] = useState<any>(null);

  // Fetch reseller data
  const { data: resellers } = useQuery({
    queryKey: ['/api/admin/resellers'],
  });

  // Find the current reseller
  useEffect(() => {
    if (resellers && params?.id) {
      const resellerId = parseInt(params.id);
      const currentReseller = resellers.find(r => r.id === resellerId);
      setReseller(currentReseller);
    }
  }, [resellers, params]);

  // Fetch keys for this reseller
  const { data: keys, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/resellers', params?.id, 'keys'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/admin/resellers/${params?.id}/keys`);
      return response.json();
    },
    enabled: !!params?.id
  });

  // Delete/revoke key mutation
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/keys/${keyId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resellers', params?.id, 'keys'] });
      toast({
        title: "Key Revoked",
        description: "The key has been successfully revoked",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke key",
        variant: "destructive",
      });
    },
  });

  const handleRevokeKey = (keyId: number) => {
    revokeKeyMutation.mutate(keyId);
  };

  const openDeleteDialog = (key: any) => {
    setSelectedKey(key);
    setDeleteDialogOpen(true);
  };

  const copyKeyToClipboard = (keyString: string) => {
    navigator.clipboard.writeText(keyString);
    setIsCopied(true);
    
    toast({
      title: "Copied!",
      description: "Key copied to clipboard",
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  if (!match) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/admin/resellers")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Manage Keys {reseller && `for ${reseller.username}`}
          </h2>
        </div>
        <p className="text-muted-foreground text-sm">View and manage all license keys for this reseller</p>
      </div>

      <Card className="overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-500/5">
        <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-900/20 to-indigo-900/20 hidden sm:block">
          <CardTitle className="text-base font-medium bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
            License Keys
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    License Key
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Game
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Expires
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Devices
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-muted-foreground">
                      <div className="flex justify-center">
                        <div className="animate-spin h-5 w-5 border-t-2 border-purple-500 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ) : keys && keys.length > 0 ? (
                  keys.map((key) => {
                    const statusColor = getStatusColor(key.status);
                    return (
                      <tr key={key.id} className="hover:bg-purple-900/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium font-mono">
                              <div className="flex items-center">
                                <span className="mr-2">{key.keyString}</span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => copyKeyToClipboard(key.keyString)}
                                      >
                                        {isCopied ? (
                                          <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <Copy className="h-3 w-3 text-muted-foreground" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copy key</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          <Badge variant="outline" className="border-indigo-500 bg-indigo-500/10 text-indigo-500">
                            {key.game}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(key.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(key.expiryDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-muted-foreground">
                              {key.deviceCount} / {key.deviceLimit}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant="outline"
                            className={`border-${statusColor.border} bg-${statusColor.bg} text-${statusColor.text}`}
                          >
                            {key.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-500"
                            onClick={() => openDeleteDialog(key)}
                            disabled={key.isRevoked}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Revoke
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-muted-foreground">
                      No keys found for this reseller
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin h-8 w-8 border-t-2 border-purple-500 rounded-full mx-auto"></div>
                <p className="mt-3 text-muted-foreground">Loading keys...</p>
              </div>
            ) : keys && keys.length > 0 ? (
              keys.map((key) => {
                const statusColor = getStatusColor(key.status);
                return (
                  <Card key={key.id} className="overflow-hidden border border-purple-500/20 shadow-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between border-b border-border p-4">
                        <div>
                          <div className="font-medium font-mono text-xs flex items-center">
                            <span className="mr-2">{key.keyString}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyKeyToClipboard(key.keyString)}
                            >
                              {isCopied ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <Badge variant="outline" className="border-indigo-500 bg-indigo-500/10 text-indigo-500">
                              {key.game}
                            </Badge>
                          </div>
                        </div>
                        <Badge 
                          variant="outline"
                          className={`border-${statusColor.border} bg-${statusColor.bg} text-${statusColor.text}`}
                        >
                          {key.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 divide-x divide-border">
                        <div className="p-3 text-center">
                          <div className="text-xs text-muted-foreground flex flex-col items-center">
                            <Calendar className="h-3 w-3 mb-1" />
                            Created
                          </div>
                          <div className="font-medium text-xs">
                            {new Date(key.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="p-3 text-center">
                          <div className="text-xs text-muted-foreground flex flex-col items-center">
                            <Clock className="h-3 w-3 mb-1" />
                            Expires
                          </div>
                          <div className="font-medium text-xs">
                            {new Date(key.expiryDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="p-3 text-center">
                          <div className="text-xs text-muted-foreground flex flex-col items-center">
                            <Smartphone className="h-3 w-3 mb-1" />
                            Devices
                          </div>
                          <div className="font-medium text-xs">
                            {key.deviceCount} / {key.deviceLimit}
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-500"
                          onClick={() => openDeleteDialog(key)}
                          disabled={key.isRevoked}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Revoke Key
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No keys found for this reseller</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog - Enhanced for better mobile support */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md mobile-dialog-content border border-purple-500/20">
          <div className="mobile-dialog-handle"></div>
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" /> Revoke License Key
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this license key? This action cannot be undone and will immediately disable the key for all users.
            </DialogDescription>
          </DialogHeader>
          
          {selectedKey && (
            <div className="bg-muted/30 p-3 rounded-md border border-border my-2">
              <div className="flex justify-between items-center">
                <div className="font-mono text-xs">{selectedKey.keyString}</div>
                <Badge variant="outline" className="border-indigo-500 bg-indigo-500/10 text-indigo-500">
                  {selectedKey.game}
                </Badge>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" /> Expires: {formatDate(selectedKey.expiryDate)}
                </div>
                <div className="flex items-center">
                  <Smartphone className="h-3 w-3 mr-1" /> Devices: {selectedKey.deviceCount} / {selectedKey.deviceLimit}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="sm:mt-0"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedKey && handleRevokeKey(selectedKey.id)}
              disabled={revokeKeyMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {revokeKeyMutation.isPending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full mr-2"></div>
                  Revoking...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" /> Revoke Key
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}