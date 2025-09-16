import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogTitle,
  MobileDialogDescription,
} from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface GenerateTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GenerateTokenModal({
  open,
  onOpenChange,
}: GenerateTokenModalProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [credits, setCredits] = useState<string>("");

  // Generate token mutation
  const generateTokenMutation = useMutation({
    mutationFn: async () => {
      const body = credits ? { credits: parseInt(credits) } : {};
      const response = await apiRequest("POST", "/api/admin/tokens/generate", body);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setCredits("");
      onOpenChange(false);
      
      // Copy the token to clipboard
      if (data.token?.token) {
        navigator.clipboard.writeText(data.token.token);
        const creditsText = credits ? ` with ${credits} credits` : '';
        toast({
          title: "Token Generated",
          description: `New token${creditsText} has been created and copied to clipboard: ${data.token.token}`,
        });
      } else {
        toast({
          title: "Token Generated",
          description: "New referral token has been created",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate token",
        variant: "destructive",
      });
    },
  });

  const handleGenerateToken = () => {
    generateTokenMutation.mutate();
  };

  // Form content that's common to both dialog types
  const formContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="credits">Credits (Optional)</Label>
        <Input
          id="credits"
          type="number"
          min="0"
          placeholder="0"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          data-testid="input-credits"
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to generate a normal token without credits. Add credits to give bonus credits to whoever uses this token.
        </p>
      </div>
      <Separator />
      <Button
        className="w-full"
        onClick={handleGenerateToken}
        disabled={generateTokenMutation.isPending}
        data-testid="button-generate-token"
      >
        {generateTokenMutation.isPending ? "Generating..." : "Generate Token"}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="mobile-dialog-content">
          <div className="mobile-dialog-handle"></div>
          <DialogHeader>
            <DialogTitle>Generate Referral Token</DialogTitle>
            <DialogDescription>
              Generate a new referral token that can be used to register a reseller account.
              The token will be copied to your clipboard.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {formContent}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Referral Token</DialogTitle>
          <DialogDescription>
            Generate a new referral token that can be used to register a reseller account.
            The token will be copied to your clipboard.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}
