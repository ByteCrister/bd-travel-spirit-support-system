import React from "react";

const RowSkeleton = () => (
  <div className="flex items-center gap-4 p-3">
    <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
    <div className="h-4 w-1/4 bg-slate-200 rounded animate-pulse" />
    <div className="h-4 w-1/6 bg-slate-200 rounded animate-pulse" />
    <div className="h-4 w-1/6 bg-slate-200 rounded animate-pulse" />
    <div className="h-4 w-1/6 bg-slate-200 rounded animate-pulse" />
    <div className="h-4 w-1/12 bg-slate-200 rounded animate-pulse" />
  </div>
);

const TableSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg bg-white shadow-sm divide-y">
      {Array.from({ length: 8 }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
};

export default TableSkeleton;
