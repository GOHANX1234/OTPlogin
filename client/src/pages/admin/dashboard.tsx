import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/layouts/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { 
  Users, 
  Key, 
  Ticket,
  UserPlus,
  CreditCard
} from "lucide-react";

export default function AdminDashboard() {
  // Fetch dashboard statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  // Fetch resellers for activity list
  const { data: resellers, isLoading: isLoadingResellers } = useQuery({
    queryKey: ['/api/admin/resellers'],
  });

  return (
    <AdminLayout>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Dashboard Overview</h2>
        <p className="text-muted-foreground text-sm pb-4">Monitor your license system activity</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Stats Cards */}
        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="bg-purple-900/30 p-3 rounded-full border border-purple-500/20 mr-4">
                <Users className="text-purple-400 h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Resellers</p>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                  {isLoadingStats ? "..." : stats?.totalResellers || 0}
                </h3>
              </div>
            </div>
            <div className="bg-purple-900/10 h-1 w-full"></div>
          </CardContent>
        </Card>
        
        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="bg-green-900/30 p-3 rounded-full border border-green-500/20 mr-4">
                <Key className="text-green-400 h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active Keys</p>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  {isLoadingStats ? "..." : stats?.activeKeys || 0}
                </h3>
              </div>
            </div>
            <div className="bg-green-900/10 h-1 w-full"></div>
          </CardContent>
        </Card>
        
        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="bg-blue-900/30 p-3 rounded-full border border-blue-500/20 mr-4">
                <Ticket className="text-blue-400 h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Available Tokens</p>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                  {isLoadingStats ? "..." : stats?.availableTokens || 0}
                </h3>
              </div>
            </div>
            <div className="bg-blue-900/10 h-1 w-full"></div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-500/5">
        <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
          <CardTitle className="text-base font-medium bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingResellers ? (
            <div className="p-6 text-center text-muted-foreground flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-purple-900/30 rounded-full mb-2"></div>
                <div className="h-2.5 bg-purple-900/30 rounded-full w-24 mb-1.5"></div>
                <div className="h-2 bg-purple-900/20 rounded-full w-16"></div>
              </div>
            </div>
          ) : resellers && resellers.length > 0 ? (
            <div className="divide-y divide-border">
              {resellers.slice(0, 5).map((reseller, index) => (
                <div key={reseller.id || index} className="py-3 px-6 hover:bg-purple-900/5 transition-colors">
                  <div className="flex items-center">
                    <div className="bg-purple-900/30 p-2 rounded-full mr-3 border border-purple-500/20">
                      <UserPlus className="text-purple-400 h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm">
                        Reseller registered: <span className="font-medium text-purple-400">{reseller.username}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(reseller.registrationDate || new Date())}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <div className="mb-2 flex justify-center">
                <div className="bg-purple-900/30 p-3 rounded-full border border-purple-500/20">
                  <UserPlus className="text-purple-400 h-5 w-5" />
                </div>
              </div>
              <p>No resellers registered yet</p>
              <p className="text-xs mt-1">Generate tokens to invite resellers</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
