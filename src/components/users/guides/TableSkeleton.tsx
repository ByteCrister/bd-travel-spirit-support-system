// components/guide/TableSkeleton.tsx
"use client";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_SKELETON_ROW =
  "bg-[#E7E5E4] border-b border-[#1E2938]/[0.06] px-4 py-4 grid gap-4 items-center";

const NEU_SKELETON_HEADER =
  "bg-[#E7E5E4] border-b border-[#1E2938]/10 px-4 py-3 grid gap-4";

const NEU_SKELETON_CELL = "rounded-lg bg-[#d0cecd] animate-pulse";

// ─────────────────────────────────────────────────────────────────────────────

type TableSkeletonProps = {
  rows?: number;
  cols?: number;
};

export function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
  const gridStyle = { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` };

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60"
      role="status"
      aria-label="Loading table data"
      aria-busy="true"
    >
      {/* Header */}
      <div className={NEU_SKELETON_HEADER} style={gridStyle}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex items-center">
            <div className={`${NEU_SKELETON_CELL} h-3 w-20 bg-[#c0bebd]`} />
          </div>
        ))}
      </div>

      {/* Rows */}
      <div>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className={NEU_SKELETON_ROW} style={gridStyle}>
            {Array.from({ length: cols }).map((_, colIdx) => (
              <div key={colIdx} className="flex items-center">
                <div
                  className={`${NEU_SKELETON_CELL} h-4`}
                  style={{
                    width: `${55 + ((colIdx * 13 + rowIdx * 7) % 35)}%`,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
