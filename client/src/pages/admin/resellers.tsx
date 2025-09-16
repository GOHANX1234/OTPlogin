import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/layouts/admin-layout";
import AddCreditModal from "@/components/add-credit-modal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PlusCircle, Edit, Ban, Key } from "lucide-react";

export default function AdminResellers() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [addCreditModalOpen, setAddCreditModalOpen] = useState(false);

  // Fetch resellers
  const { data: resellers = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/resellers'],
  });

  // Toggle reseller status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/resellers/${id}/toggle-status`,
        { isActive }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resellers'] });
      toast({
        title: "Success",
        description: "Reseller status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update reseller status",
        variant: "destructive",
      });
    },
  });

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    toggleStatusMutation.mutate({
      id,
      isActive: !currentStatus,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-2 mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Manage Resellers</h2>
        <p className="text-muted-foreground text-sm">Add credits or suspend reseller accounts</p>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 w-full sm:w-auto gap-2">
          <Button
            onClick={() => setAddCreditModalOpen(true)}
            className="bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/20 border border-purple-500/20"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Credit
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-500/5">
        <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-900/20 to-indigo-900/20 hidden sm:block">
          <CardTitle className="text-base font-medium bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Reseller Accounts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Credit Balance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Keys
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
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-muted-foreground">
                      <div className="flex justify-center">
                        <div className="animate-spin h-5 w-5 border-t-2 border-purple-500 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ) : resellers.length > 0 ? (
                  resellers.map((reseller) => (
                    <tr key={reseller.id} className="hover:bg-purple-900/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/20">
                            <span className="text-purple-400 font-medium">
                              {reseller.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">
                              {reseller.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(reseller.registrationDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-500">
                          {reseller.credits}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {reseller.totalKeys || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={reseller.isActive ? "outline" : "secondary"}
                          className={reseller.isActive ? "border-green-500 bg-green-500/10 text-green-500" : ""}
                        >
                          {reseller.isActive ? "Active" : "Suspended"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500"
                            onClick={() => navigate(`/admin/resellers/${reseller.id}/keys`)}
                          >
                            <Key className="h-4 w-4 mr-1" /> Keys
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={reseller.isActive 
                              ? "border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-500" 
                              : "border-green-500 bg-green-500/10 hover:bg-green-500/20 text-green-500"}
                            onClick={() => handleToggleStatus(reseller.id, reseller.isActive)}
                            disabled={toggleStatusMutation.isPending}
                          >
                            {reseller.isActive ? (
                              <>
                                <Ban className="h-4 w-4 mr-1" /> Suspend
                              </>
                            ) : (
                              "Activate"
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-muted-foreground">
                      No resellers found
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
                <p className="mt-3 text-muted-foreground">Loading resellers...</p>
              </div>
            ) : resellers.length > 0 ? (
              resellers.map((reseller) => (
                <Card key={reseller.id} className="overflow-hidden border border-purple-500/20 shadow-sm">
                  <CardContent className="p-0">
                    <div className="flex items-center border-b border-border p-4">
                      <div className="h-10 w-10 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/20 mr-3">
                        <span className="text-purple-400 font-medium">
                          {reseller.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{reseller.username}</div>
                        <div className="text-xs text-muted-foreground">Joined {formatDate(reseller.registrationDate)}</div>
                      </div>
                      <Badge 
                        variant={reseller.isActive ? "outline" : "secondary"}
                        className={`ml-auto ${reseller.isActive ? "border-green-500 bg-green-500/10 text-green-500" : ""}`}
                      >
                        {reseller.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-border">
                      <div className="p-3 text-center">
                        <div className="text-xs text-muted-foreground">Credits</div>
                        <div className="font-medium text-green-500">{reseller.credits}</div>
                      </div>
                      <div className="p-3 text-center">
                        <div className="text-xs text-muted-foreground">Total Keys</div>
                        <div className="font-medium">{reseller.totalKeys || 0}</div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-border grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500"
                        onClick={() => navigate(`/admin/resellers/${reseller.id}/keys`)}
                      >
                        <Key className="h-4 w-4 mr-2" /> View Keys
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={reseller.isActive 
                          ? "border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-500" 
                          : "border-green-500 bg-green-500/10 hover:bg-green-500/20 text-green-500"}
                        onClick={() => handleToggleStatus(reseller.id, reseller.isActive)}
                        disabled={toggleStatusMutation.isPending}
                      >
                        {reseller.isActive ? (
                          <>
                            <Ban className="h-4 w-4 mr-2" /> Suspend
                          </>
                        ) : (
                          "Activate"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No resellers found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddCreditModal
        open={addCreditModalOpen}
        onOpenChange={setAddCreditModalOpen}
      />
    </AdminLayout>
  );
}