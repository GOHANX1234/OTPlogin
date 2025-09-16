import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/layouts/admin-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Link as LinkIcon,
  MessageSquare,
  Eye,
  EyeOff,
  Calendar,
  Smartphone
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface OnlineUpdate {
  id: number;
  title: string;
  message: string;
  buttonText?: string;
  linkUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UpdateFormData {
  title: string;
  message: string;
  buttonText: string;
  linkUrl: string;
  isActive: boolean;
}

function UpdateForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading 
}: {
  initialData?: OnlineUpdate;
  onSubmit: (data: UpdateFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<UpdateFormData>({
    title: initialData?.title || "",
    message: initialData?.message || "",
    buttonText: initialData?.buttonText || "",
    linkUrl: initialData?.linkUrl || "",
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length > 500) {
      newErrors.message = "Message must be less than 500 characters";
    }
    
    if (formData.buttonText && !formData.linkUrl) {
      newErrors.linkUrl = "Link URL is required when button text is provided";
    }
    
    if (formData.linkUrl && formData.linkUrl.trim()) {
      try {
        new URL(formData.linkUrl);
      } catch {
        newErrors.linkUrl = "Please enter a valid URL";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="title" className="text-sm">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Update title"
          className={`h-9 ${errors.title ? "border-red-500" : ""}`}
          data-testid="input-title"
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="message" className="text-sm">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Update message content"
          rows={2}
          className={`resize-none ${errors.message ? "border-red-500" : ""}`}
          data-testid="input-message"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {errors.message && <span className="text-red-500">{errors.message}</span>}
          <span className="ml-auto">{formData.message.length}/500</span>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="buttonText" className="text-sm">Button Text (Optional)</Label>
        <Input
          id="buttonText"
          value={formData.buttonText}
          onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
          placeholder="e.g., Download, Update Now"
          className="h-9"
          data-testid="input-button-text"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="linkUrl" className="text-sm">Link URL {formData.buttonText && "(Required)"}</Label>
        <Input
          id="linkUrl"
          type="url"
          value={formData.linkUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
          placeholder="https://example.com/download"
          className={`h-9 ${errors.linkUrl ? "border-red-500" : ""}`}
          data-testid="input-link-url"
        />
        {errors.linkUrl && <p className="text-xs text-red-500">{errors.linkUrl}</p>}
      </div>

      <div className="flex items-center space-x-2 py-1">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          data-testid="switch-active"
        />
        <Label htmlFor="isActive" className="text-sm">Active (visible to apps)</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="h-9" data-testid="button-cancel">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="h-9" data-testid="button-submit">
          {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminOnlineUpdate() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<OnlineUpdate | null>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Fetch all online updates
  const { data: updates, isLoading } = useQuery<OnlineUpdate[]>({
    queryKey: ['/api/admin/online-updates'],
  });

  // Create update mutation
  const createMutation = useMutation({
    mutationFn: async (data: UpdateFormData) => {
      const response = await fetch('/api/admin/online-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create update');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/online-updates'] });
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Update created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateFormData }) => {
      const response = await fetch(`/api/admin/online-updates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/online-updates'] });
      setEditingUpdate(null);
      toast({
        title: "Success",
        description: "Update saved successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete update mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/online-updates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete update');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/online-updates'] });
      toast({
        title: "Success",
        description: "Update deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (update: OnlineUpdate) => {
    if (window.confirm(`Are you sure you want to delete "${update.title}"?`)) {
      deleteMutation.mutate(update.id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
              Online Updates
            </h2>
            <p className="text-muted-foreground text-sm">
              Send real-time updates to your apps with messages, links, and buttons
            </p>
          </div>
          
          {isMobile ? (
            <Drawer open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DrawerTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-create-update">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Update
                </Button>
              </DrawerTrigger>
              <DrawerContent className="flex flex-col max-h-[50vh] min-h-[40vh]">
                <DrawerHeader className="px-4 pb-2">
                  <DrawerTitle>Create New Update</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4 flex-1 overflow-y-auto">
                  <UpdateForm
                    onSubmit={(data) => createMutation.mutate(data)}
                    onCancel={() => setIsCreateModalOpen(false)}
                    isLoading={createMutation.isPending}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-create-update">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Update
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Update</DialogTitle>
                  <DialogDescription>
                    Create a new online update that will be sent to your apps with messages, links, and buttons.
                  </DialogDescription>
                </DialogHeader>
                <UpdateForm
                  onSubmit={(data) => createMutation.mutate(data)}
                  onCancel={() => setIsCreateModalOpen(false)}
                  isLoading={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* API Information */}
        <Card className="border border-blue-500/20 bg-blue-900/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-400 flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              App Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-sm text-muted-foreground mb-2">
                Apps can fetch active updates using:
              </p>
              <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                GET /api/updates
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Updates List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-muted rounded w-20"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : updates && updates.length > 0 ? (
            <div className="grid gap-4">
              {updates.map((update) => (
                <Card 
                  key={update.id} 
                  className={`border transition-all ${
                    update.isActive 
                      ? 'border-green-500/20 bg-green-900/5' 
                      : 'border-gray-500/20 bg-gray-900/5'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{update.title}</CardTitle>
                          <Badge 
                            variant={update.isActive ? "default" : "secondary"}
                            className={update.isActive ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {update.isActive ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {update.message}
                        </p>
                        {update.buttonText && update.linkUrl && (
                          <div className="flex items-center gap-2 text-xs text-purple-400">
                            <LinkIcon className="h-3 w-3" />
                            Button: "{update.buttonText}" → {update.linkUrl}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created {formatDate(update.createdAt)}
                          </div>
                          {update.updatedAt !== update.createdAt && (
                            <div>
                              Updated {formatDate(update.updatedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {isMobile ? (
                          <Drawer 
                            open={editingUpdate?.id === update.id} 
                            onOpenChange={(open) => !open && setEditingUpdate(null)}
                          >
                            <DrawerTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingUpdate(update)}
                                data-testid={`button-edit-update-${update.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DrawerTrigger>
                            <DrawerContent className="flex flex-col max-h-[50vh] min-h-[40vh]">
                              <DrawerHeader className="px-4 pb-2">
                                <DrawerTitle>Edit Update</DrawerTitle>
                              </DrawerHeader>
                              <div className="px-4 pb-4 flex-1 overflow-y-auto">
                                <UpdateForm
                                  initialData={update}
                                  onSubmit={(data) => updateMutation.mutate({ id: update.id, data })}
                                  onCancel={() => setEditingUpdate(null)}
                                  isLoading={updateMutation.isPending}
                                />
                              </div>
                            </DrawerContent>
                          </Drawer>
                        ) : (
                          <Dialog 
                            open={editingUpdate?.id === update.id} 
                            onOpenChange={(open) => !open && setEditingUpdate(null)}
                          >
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingUpdate(update)}
                                data-testid={`button-edit-update-${update.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Edit Update</DialogTitle>
                                <DialogDescription>
                                  Modify the existing update details including title, message, button text and link URL.
                                </DialogDescription>
                              </DialogHeader>
                              <UpdateForm
                                initialData={update}
                                onSubmit={(data) => updateMutation.mutate({ id: update.id, data })}
                                onCancel={() => setEditingUpdate(null)}
                                isLoading={updateMutation.isPending}
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(update)}
                          disabled={deleteMutation.isPending}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-purple-500/20">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="bg-purple-900/30 w-16 h-16 rounded-full mx-auto flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">No updates yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first update to send messages to your apps
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}