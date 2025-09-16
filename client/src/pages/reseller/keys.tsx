import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ResellerLayout from "@/layouts/reseller-layout";
import KeyDetailsModal from "@/components/key-details-modal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, getStatusColor } from "@/lib/utils";
import { Search, Eye, Trash2, Gamepad2, Calendar, CalendarClock, Smartphone } from "lucide-react";

export default function ResellerKeys() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const [keyDetailsOpen, setKeyDetailsOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<number | null>(null);

  // Fetch keys
  const { data: keys, isLoading } = useQuery({
    queryKey: ['/api/reseller/keys'],
  });

  // Revoke key mutation
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const response = await apiRequest(
        "POST",
        `/api/reseller/keys/${keyId}/revoke`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reseller/keys'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reseller/profile'] });
      toast({
        title: "Success",
        description: "Key revoked successfully",
      });
      setRevokeDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke key",
        variant: "destructive",
      });
    },
  });

  const handleViewKey = (keyId: number) => {
    setSelectedKeyId(keyId);
    setKeyDetailsOpen(true);
  };

  const handleRevokeKey = (keyId: number) => {
    setKeyToRevoke(keyId);
    setRevokeDialogOpen(true);
  };

  const confirmRevokeKey = () => {
    if (keyToRevoke) {
      revokeKeyMutation.mutate(keyToRevoke);
    }
  };

  // Filter keys
  const filteredKeys = keys?.filter((key) => {
    // Filter by search term
    const matchesSearch = searchTerm === "" || 
      key.keyString.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by game
    const matchesGame = gameFilter === "all" || key.game === gameFilter;
    
    return matchesSearch && matchesGame;
  });

  return (
    <ResellerLayout>
      <div className="space-y-2 mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Manage Keys</h2>
        <p className="text-muted-foreground text-sm">View and revoke your license keys</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search keys..."
            className="pl-9 pr-4 py-2 bg-background border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={gameFilter}
          onValueChange={setGameFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
            <SelectValue placeholder="All Games" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            <SelectItem value="PUBG MOBILE">PUBG MOBILE</SelectItem>
            <SelectItem value="LAST ISLAND OF SURVIVAL">LAST ISLAND OF SURVIVAL</SelectItem>
            <SelectItem value="STANDOFF2">STANDOFF2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop View */}
      <Card className="overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-500/5 hidden md:block">
        <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
          <CardTitle className="text-base font-medium bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Your License Keys</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Key
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Game
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Expiry
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
                ) : filteredKeys && filteredKeys.length > 0 ? (
                  filteredKeys.map((key) => {
                    const statusColor = getStatusColor(key.status);
                    return (
                      <tr key={key.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono bg-muted/30 p-1.5 rounded">
                            {key.keyString.length > 20 
                              ? `${key.keyString.substring(0, 20)}...` 
                              : key.keyString}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {key.game}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(key.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(key.expiryDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {key.devices}/{key.deviceLimit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant="outline"
                            className={`${statusColor.bg} ${statusColor.text}`}
                          >
                            {key.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-500/20 bg-blue-900/10 text-blue-500 hover:bg-blue-900/20"
                              onClick={() => handleViewKey(key.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            {key.status === "ACTIVE" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/20 bg-red-900/10 text-red-500 hover:bg-red-900/20"
                                onClick={() => handleRevokeKey(key.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Revoke
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-muted-foreground">
                      No keys found. {searchTerm || gameFilter !== "all" ? "Try changing your search filters." : ""}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-purple-500 rounded-full mx-auto"></div>
            <p className="mt-3 text-muted-foreground">Loading keys...</p>
          </div>
        ) : filteredKeys && filteredKeys.length > 0 ? (
          filteredKeys.map((key) => {
            const statusColor = getStatusColor(key.status);
            return (
              <Card key={key.id} className="overflow-hidden border border-purple-500/20 shadow-sm">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <div className="bg-muted/30 px-3 py-2 rounded font-mono text-sm overflow-hidden text-ellipsis max-w-[160px]">
                      {key.keyString}
                    </div>
                    <Badge 
                      variant="outline"
                      className={`${statusColor.bg} ${statusColor.text}`}
                    >
                      {key.status}
                    </Badge>
                  </div>
                  
                  <div className="px-4 py-3 space-y-2 border-b border-border">
                    <div className="flex items-center text-sm">
                      <Gamepad2 className="h-4 w-4 mr-2 text-purple-400" />
                      <span className="text-muted-foreground">Game:</span>
                      <span className="ml-2 font-medium">{key.game}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                      <span className="text-muted-foreground">Created:</span>
                      <span className="ml-2">{formatDate(key.createdAt)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CalendarClock className="h-4 w-4 mr-2 text-purple-400" />
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="ml-2">{formatDate(key.expiryDate)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Smartphone className="h-4 w-4 mr-2 text-purple-400" />
                      <span className="text-muted-foreground">Devices:</span>
                      <span className="ml-2">{key.devices}/{key.deviceLimit}</span>
                    </div>
                  </div>
                  
                  <div className="flex p-3 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-blue-500/20 bg-blue-900/10 text-blue-500 hover:bg-blue-900/20"
                      onClick={() => handleViewKey(key.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </Button>
                    {key.status === "ACTIVE" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-500/20 bg-red-900/10 text-red-500 hover:bg-red-900/20"
                        onClick={() => handleRevokeKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Revoke
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border border-purple-500/20 shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No keys found. {searchTerm || gameFilter !== "all" ? "Try changing your search filters." : ""}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Key Details Modal */}
      <KeyDetailsModal
        keyId={selectedKeyId}
        open={keyDetailsOpen}
        onOpenChange={setKeyDetailsOpen}
      />

      {/* Revoke Key Confirmation Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md !top-[30%] md:!top-[50%] !left-[5vw] md:!left-[50%] !right-[5vw] md:!right-auto !transform-none md:!translate-x-[-50%] md:!translate-y-[-50%] !max-h-[60vh] !overflow-y-auto">
          <DialogHeader className="text-center space-y-3 pb-4">
            <DialogTitle className="text-lg font-semibold text-red-500">
              Revoke License Key
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to revoke this key? This action cannot be undone.
              Users will no longer be able to use this license key after revocation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-3 pt-4">
            <Button 
              variant="destructive" 
              className="w-full h-12 text-base font-medium"
              onClick={confirmRevokeKey}
              disabled={revokeKeyMutation.isPending}
            >
              {revokeKeyMutation.isPending ? "Revoking..." : "Revoke Key"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-medium" 
              onClick={() => setRevokeDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ResellerLayout>
  );
}