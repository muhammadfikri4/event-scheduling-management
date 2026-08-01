export function TableSkeleton({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex gap-4 px-4 py-3 border-b last:border-0">
          {Array.from({ length: columns }).map((_, ci) => (
            <div key={ci} className="h-4 bg-muted/60 rounded flex-1" style={{ width: `${60 + ((ri * columns + ci) * 17 % 40)}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
