"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PayrollStatus } from "@/constants/employee.const";

interface PaymentStatusBadgeProps {
  status: PayrollStatus;
  amount: number;
  currency: string;
  isRetryable?: boolean;
  onRetry?: (e: React.MouseEvent) => void;
  isLoading?: boolean;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  amount,
  currency,
  isRetryable = false,
  onRetry,
  isLoading = false,
  className,
}: PaymentStatusBadgeProps) {
  const config = {
    pending: {
      icon: <Clock className="h-3 w-3" />,
      label: "Pending",
      variant: "secondary" as const,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    paid: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: "Paid",
      variant: "default" as const,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    failed: {
      icon: <AlertCircle className="h-3 w-3" />,
      label: "Failed",
      variant: "destructive" as const,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  };

  const currentConfig = config[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        variant={currentConfig.variant}
        className={cn(
          "gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
          currentConfig.bgColor,
          currentConfig.color
        )}
      >
        {currentConfig.icon}
        <span>{currentConfig.label}</span>
      </Badge>
      
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {currency} {amount.toLocaleString()}
      </span>
      
      {status === "failed" && isRetryable && onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRetry(e);
          }}
          disabled={isLoading}
          className="h-6 w-6 p-0 hover:bg-muted"
          title="Retry payment"
        >
          <RefreshCw className={cn(
            "h-3 w-3",
            isLoading && "animate-spin"
          )} />
        </Button>
      )}
    </div>
  );
}