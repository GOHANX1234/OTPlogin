import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface ToastNotificationProps {
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose?: () => void;
}

export function ToastNotification({
  title,
  message,
  type = "info",
  onClose,
}: ToastNotificationProps) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const styles = {
    success: "border-green-500 bg-green-50",
    error: "border-red-500 bg-red-50",
    warning: "border-yellow-500 bg-yellow-50",
    info: "border-blue-500 bg-blue-50",
  };

  return (
    <Toast className={cn("border-l-4", styles[type])}>
      <div className="flex items-start gap-3">
        <div className="pt-0.5">{icons[type]}</div>
        <div className="flex-1">
          <div className="font-medium">{title}</div>
          {message && <div className="text-sm text-muted-foreground">{message}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
    </Toast>
  );
}
