export function DataTableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 bg-muted rounded-md" />
      ))}
    </div>
  );
}