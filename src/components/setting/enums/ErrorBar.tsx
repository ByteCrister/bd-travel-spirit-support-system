// src/components/enums/ErrorBar.tsx
"use client";

import { Button } from "@/components/ui/button";
import React, { JSX } from "react";

export default function ErrorBar({ message, onRetry }: { message: string; onRetry?: () => void }): JSX.Element {
  return (
    <div role="alert" className="p-3 rounded bg-red-50 border border-red-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-medium text-red-800">Error</div>
          <div className="text-sm text-red-700 mt-1">{message}</div>
        </div>
        {onRetry && <Button onClick={onRetry}>Retry</Button>}
      </div>
    </div>
  );
}
