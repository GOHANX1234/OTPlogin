import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Database, 
  FileText, 
  Archive,
  Clock,
  HardDrive,
  RefreshCw,
  AlertCircle 
} from "lucide-react";
import { format } from "date-fns";

interface BackupCollection {
  name: string;
  collectionName: string;
  size: number;
  count: number;
  modified: string;
  downloadUrl: string;
}

export default function DatabaseBackup() {
  const [collections, setCollections] = useState<BackupCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/backup/collections');
      if (!response.ok) {
        throw new Error('Failed to fetch MongoDB collections');
      }
      const data = await response.json();
      setCollections(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load MongoDB collections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const downloadFile = async (filename: string) => {
    try {
      setDownloadingFile(filename);
      const response = await fetch(`/api/admin/backup/download/${encodeURIComponent(filename)}`);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `${filename} downloaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download file",
        variant: "destructive",
      });
    } finally {
      setDownloadingFile(null);
    }
  };

  const downloadAll = async () => {
    try {
      setDownloadingAll(true);
      const response = await fetch('/api/admin/backup/download-all');
      if (!response.ok) {
        throw new Error('Failed to download backup archive');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Get filename from response headers or create one
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `dexter-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Complete backup archive downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message || "Failed to download backup archive",
        variant: "destructive",
      });
    } finally {
      setDownloadingAll(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileType = (filename: string) => {
    if (filename.includes('admin')) return { type: 'Admin', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (filename.includes('token')) return { type: 'Tokens', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    if (filename.includes('device')) return { type: 'Devices', color: 'bg-green-500/10 text-green-400 border-green-500/20' };
    if (filename.includes('keys')) return { type: 'Keys', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    if (filename.includes('reseller')) return { type: 'Resellers', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    return { type: 'User Data', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Database Backup</h1>
            <p className="text-muted-foreground mt-1">Download MongoDB collections for backup and recovery</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={fetchCollections} 
              variant="outline"
              disabled={loading}
              className="bg-background/80 border-purple-500/20 hover:bg-purple-900/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={downloadAll}
              disabled={downloadingAll || collections.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white border-purple-500/20"
            >
              <Archive className="h-4 w-4 mr-2" />
              {downloadingAll ? 'Downloading...' : 'Download All'}
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-background/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900/20 rounded-lg">
                <Database className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collections</p>
                <p className="text-2xl font-bold text-foreground">{collections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/20 rounded-lg">
                <HardDrive className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-foreground">
                  {collections.reduce((acc, collection) => acc + collection.count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background/50 border-green-500/20 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium text-foreground">
                  {collections.length > 0 
                    ? format(new Date(Math.max(...collections.map(c => new Date(c.modified).getTime()))), 'MMM dd, HH:mm')
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Files List */}
      <Card className="bg-background/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            MongoDB Collections
          </CardTitle>
          <CardDescription>
            Individual MongoDB collections available for download as JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
              <span className="ml-2 text-muted-foreground">Loading files...</span>
            </div>
          ) : collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Collections Found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                There are no MongoDB collections available for backup. This might indicate an issue with the database connection.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {collections.map((collection, index) => {
                const fileInfo = getFileType(collection.name);
                return (
                  <div
                    key={collection.name}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-background/80 transition-colors ${
                      index !== collections.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-purple-900/10 rounded-lg flex-shrink-0">
                        <FileText className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground truncate">{collection.name}</p>
                          <Badge variant="outline" className={`text-xs flex-shrink-0 ${fileInfo.color}`}>
                            {fileInfo.type}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                          <span>{collection.count} records</span>
                          <span className="hidden sm:inline">•</span>
                          <span>~{formatFileSize(collection.size)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Modified {format(new Date(collection.modified), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-4">
                      <Button
                        size="sm"
                        onClick={() => downloadFile(collection.name)}
                        disabled={downloadingFile === collection.name}
                        className="w-full sm:w-auto bg-background border-purple-500/20 hover:bg-purple-900/10 text-purple-400"
                        variant="outline"
                      >
                        <Download className="h-3 w-3 mr-2" />
                        {downloadingFile === collection.name ? 'Downloading...' : 'Download'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}