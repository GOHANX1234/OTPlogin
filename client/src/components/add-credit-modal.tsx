import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogTitle,
} from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button as SelectButton } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddCreditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const addCreditSchema = z.object({
  resellerId: z.string().min(1, "Please select a reseller"),
  amount: z.string().min(1, "Amount is required"),
});

type AddCreditValues = z.infer<typeof addCreditSchema>;

interface MobileResellerSelectProps {
  resellers: any[];
  onSelect: (value: string) => void;
  selectedValue: string;
}

function MobileResellerSelect({ resellers, onSelect, selectedValue }: MobileResellerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedReseller = resellers.find(r => r.id.toString() === selectedValue);
  
  return (
    <>
      <FormControl>
        <SelectButton
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsOpen(true)}
        >
          {selectedReseller 
            ? `${selectedReseller.username} - Current: ${selectedReseller.credits} credits`
            : "Select a reseller"
          }
          <ChevronDown className="h-4 w-4" />
        </SelectButton>
      </FormControl>
      
      <MobileDialog open={isOpen} onOpenChange={setIsOpen}>
        <MobileDialogContent className="left-4 right-4 bottom-0 top-auto max-w-none rounded-t-2xl max-h-[70vh] data-[state=open]:slide-in-from-bottom">
          <MobileDialogHeader>
            <MobileDialogTitle>Select Reseller</MobileDialogTitle>
          </MobileDialogHeader>
          <div className="p-4 overflow-y-auto">
            <div className="space-y-2">
              {resellers.map((reseller: any) => (
                <button
                  key={reseller.id}
                  type="button"
                  className={`w-full p-3 text-left rounded-md border transition-colors flex items-center justify-between ${
                    selectedValue === reseller.id.toString()
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                      : 'border-border bg-background hover:bg-muted'
                  }`}
                  onClick={() => {
                    onSelect(reseller.id.toString());
                    setIsOpen(false);
                  }}
                >
                  <div>
                    <div className="font-medium">{reseller.username}</div>
                    <div className="text-sm text-muted-foreground">
                      Current: {reseller.credits} credits
                    </div>
                  </div>
                  {selectedValue === reseller.id.toString() && (
                    <Check className="h-4 w-4 text-purple-400" />
                  )}
                </button>
              ))}
              {resellers.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No resellers available
                </div>
              )}
            </div>
          </div>
        </MobileDialogContent>
      </MobileDialog>
    </>
  );
}

export default function AddCreditModal({
  open,
  onOpenChange,
}: AddCreditModalProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Fetch resellers
  const { data: resellers = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/resellers'],
    enabled: open,
  });

  const form = useForm<AddCreditValues>({
    resolver: zodResolver(addCreditSchema),
    defaultValues: {
      resellerId: "",
      amount: "",
    },
  });

  // Add credit mutation
  const addCreditMutation = useMutation({
    mutationFn: async (values: AddCreditValues) => {
      const response = await apiRequest("POST", "/api/admin/resellers/credits", {
        resellerId: parseInt(values.resellerId),
        amount: parseInt(values.amount),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resellers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      form.reset();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Credits added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add credits",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: AddCreditValues) {
    addCreditMutation.mutate(values);
  }

  const renderForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="resellerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Reseller</FormLabel>
              {isMobile ? (
                <MobileResellerSelect 
                  resellers={resellers}
                  onSelect={field.onChange}
                  selectedValue={field.value}
                />
              ) : (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reseller" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {resellers.map((reseller: any) => (
                      <SelectItem key={reseller.id} value={reseller.id.toString()}>
                        {reseller.username} - Current: {reseller.credits} credits
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter amount to add"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={addCreditMutation.isPending}
        >
          {addCreditMutation.isPending ? "Adding..." : "Add Credit"}
        </Button>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <MobileDialog open={open} onOpenChange={onOpenChange}>
        <MobileDialogContent className="left-4 right-4 bottom-4 top-auto max-w-none rounded-t-2xl data-[state=open]:slide-in-from-bottom">
          <MobileDialogHeader>
            <MobileDialogTitle>Add Credit to Reseller</MobileDialogTitle>
          </MobileDialogHeader>
          <div className="p-4">
            {renderForm()}
          </div>
        </MobileDialogContent>
      </MobileDialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Credit to Reseller</DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
