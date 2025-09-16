import { useQuery } from "@tanstack/react-query";
import ResellerLayout from "@/layouts/reseller-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";
import {
  CreditCard,
  Key,
  Timer,
  CalendarDays,
  ChevronRight,
  PlusCircle,
  TrendingUp,
  Gamepad2,
  Star,
  Wifi,
  WifiOff,
} from "lucide-react";

export default function ResellerDashboard() {

  // Fetch reseller profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/reseller/profile"],
  });

  // Fetch keys data
  const { data: keys, isLoading: keysLoading } = useQuery({
    queryKey: ["/api/reseller/keys"],
  });

  // Get counts
  const activeKeys = keys?.filter((key) => key.status === "ACTIVE")?.length || 0;
  const expiredKeys = keys?.filter((key) => key.status === "EXPIRED" || key.status === "REVOKED")?.length || 0;

  // Get five most recent keys
  const recentKeys = keys
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    ?.slice(0, 5);

  return (
    <ResellerLayout>
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Reseller Dashboard</h2>
            <p className="text-muted-foreground text-sm">Manage your license keys and credits</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5 overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1 text-purple-400" /> Credits
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {profileLoading ? (
                <div className="h-8 w-16 animate-pulse bg-muted rounded"></div>
              ) : (
                profile?.credits || 0
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Available for key generation</p>
          </CardContent>
        </Card>

        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5 overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <Key className="h-4 w-4 mr-1 text-purple-400" /> Active Keys
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {keysLoading ? (
                <div className="h-8 w-16 animate-pulse bg-muted rounded"></div>
              ) : (
                activeKeys
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Currently valid licenses</p>
          </CardContent>
        </Card>

        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5 overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <Timer className="h-4 w-4 mr-1 text-purple-400" /> Expired Keys
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {keysLoading ? (
                <div className="h-8 w-16 animate-pulse bg-muted rounded"></div>
              ) : (
                expiredKeys
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Expired or revoked licenses</p>
          </CardContent>
        </Card>

        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5 overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1 text-purple-400" /> Member Since
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {profileLoading ? (
                <div className="h-8 w-32 animate-pulse bg-muted rounded"></div>
              ) : (
                profile?.registrationDate ? formatDate(profile.registrationDate) : "N/A"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Account registration date</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5 lg:col-span-1 overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
            <CardTitle className="text-base font-medium bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Link href="/reseller/generate">
                <Button
                  variant="outline"
                  className="w-full justify-between text-left mb-2 hover:bg-purple-900/10 hover:text-purple-200 border-purple-500/20"
                >
                  <div className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4 text-purple-400" />
                    <span>Generate New Keys</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/reseller/keys">
                <Button
                  variant="outline"
                  className="w-full justify-between text-left mb-2 hover:bg-purple-900/10 hover:text-purple-200 border-purple-500/20"
                >
                  <div className="flex items-center">
                    <Key className="mr-2 h-4 w-4 text-purple-400" />
                    <span>Manage Keys</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Button
                variant="outline"
                className="w-full justify-between text-left hover:bg-purple-900/10 hover:text-purple-200 border-purple-500/20"
                disabled
              >
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-purple-400" />
                  <span>View Sales Report</span>
                </div>
                <Badge variant="outline" className="text-xs bg-purple-900/20 text-purple-300">Coming Soon</Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities Card */}
        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5 lg:col-span-2 overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
            <CardTitle className="text-base font-medium bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Recent Key Activities</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {keysLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-t-2 border-purple-500 rounded-full mx-auto"></div>
                <p className="mt-3 text-muted-foreground">Loading recent activities...</p>
              </div>
            ) : recentKeys && recentKeys.length > 0 ? (
              <div className="divide-y divide-border">
                {recentKeys.map((key) => (
                  <div key={key.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center">
                        <Gamepad2 className="h-5 w-5 mr-2 text-purple-400" />
                        <div>
                          <div className="font-medium">{key.game}</div>
                          <code className="text-xs font-mono text-muted-foreground">{key.keyString}</code>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`
                          ${key.status === "ACTIVE" ? "bg-green-500/10 text-green-500" : 
                          key.status === "EXPIRED" ? "bg-red-500/10 text-red-500" : 
                          "bg-gray-500/10 text-gray-500"}
                        `}
                      >
                        {key.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <div>Created: {formatDate(key.createdAt)}</div>
                      <div>Expires: {formatDate(key.expiryDate)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Star className="h-8 w-8 text-purple-400/50 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">No Keys Generated Yet</h3>
                <p className="text-muted-foreground text-sm mb-4">Generate your first key to see activity here</p>
                <Link href="/reseller/generate">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                    <PlusCircle className="h-4 w-4 mr-2" /> Generate Keys
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ResellerLayout>
  );
}