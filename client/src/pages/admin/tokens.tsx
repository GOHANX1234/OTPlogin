import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/layouts/admin-layout";
import GenerateTokenModal from "@/components/generate-token-modal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PlusCircle, Copy, Check } from "lucide-react";

export default function AdminTokens() {
  const [generateTokenModalOpen, setGenerateTokenModalOpen] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState<number | null>(null);
  
  // Fetch tokens
  const { data: tokens, isLoading } = useQuery({
    queryKey: ['/api/admin/tokens'],
  });

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTokenId(id);
      setTimeout(() => setCopiedTokenId(null), 2000);
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-2 mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Referral Tokens</h2>
        <p className="text-muted-foreground text-sm">Generate and manage reseller invitation tokens</p>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="w-full sm:w-auto">
          <Button
            onClick={() => setGenerateTokenModalOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/20 border border-purple-500/20"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Generate New Token
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-500/5">
        <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-900/20 to-indigo-900/20 hidden sm:block">
          <CardTitle className="text-base font-medium bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Available Tokens</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Token
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Used By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Credits
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Action
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
                ) : tokens && (tokens as any[]).length > 0 ? (
                  (tokens as any[]).map((token: any) => (
                    <tr key={token.id} className="hover:bg-purple-900/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono bg-muted/30 p-1.5 rounded-md">{token.token}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(token.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {token.usedBy ? (
                          <span className="text-muted-foreground">{token.usedBy}</span>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${token.credits > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {token.credits || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={token.isUsed ? "secondary" : "outline"}
                          className={!token.isUsed ? "border-green-500 bg-green-500/10 text-green-500" : ""}
                        >
                          {token.isUsed ? "Used" : "Available"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!token.isUsed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => copyToClipboard(token.token, token.id)}
                          >
                            {copiedTokenId === token.id ? (
                              <>
                                <Check className="h-4 w-4 mr-1 text-green-500" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1" /> Copy
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-muted-foreground">
                      No tokens found
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
                <p className="mt-3 text-muted-foreground">Loading tokens...</p>
              </div>
            ) : tokens && (tokens as any[]).length > 0 ? (
              (tokens as any[]).map((token: any) => (
                <Card key={token.id} className="overflow-hidden border border-purple-500/20 shadow-sm">
                  <CardContent className="p-0">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          variant={token.isUsed ? "secondary" : "outline"}
                          className={!token.isUsed ? "border-green-500 bg-green-500/10 text-green-500" : ""}
                        >
                          {token.isUsed ? "Used" : "Available"}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(token.createdAt)}
                        </div>
                      </div>
                      {token.credits > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-green-500 font-medium">
                            {token.credits} credits included
                          </span>
                        </div>
                      )}
                      <div className="bg-muted/30 p-2 rounded-md text-sm font-mono break-all">
                        {token.token}
                      </div>
                      {!token.isUsed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3 text-muted-foreground"
                          onClick={() => copyToClipboard(token.token, token.id)}
                        >
                          {copiedTokenId === token.id ? (
                            <>
                              <Check className="h-4 w-4 mr-2 text-green-500" /> Copied to clipboard
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" /> Copy token
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    {token.usedBy && (
                      <div className="p-3 bg-muted/10">
                        <div className="text-xs text-muted-foreground">Used by</div>
                        <div className="font-medium">{token.usedBy}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No tokens found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <GenerateTokenModal
        open={generateTokenModalOpen}
        onOpenChange={setGenerateTokenModalOpen}
      />
    </AdminLayout>
  );
}