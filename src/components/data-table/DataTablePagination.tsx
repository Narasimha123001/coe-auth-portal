import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  page,
  totalPages,
  onPageChange,
}: Props) {

  if (totalPages <= 1) return null;

  const visiblePages = 5;
  const start = Math.max(0, page - Math.floor(visiblePages / 2));
  const end = Math.min(totalPages, start + visiblePages);

  const pages = [];
  for (let i = start; i < end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">

      {/* Previous */}
      <Button
        variant="outline"
        size="sm"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </Button>

      {/* First Page */}
      {start > 0 && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(0)}
          >
            1
          </Button>
          {start > 1 && <span className="px-2 text-muted-foreground">...</span>}
        </>
      )}

      {/* Middle Pages */}
      {pages.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === page ? "default" : "outline"}
          onClick={() => onPageChange(p)}
        >
          {p + 1}
        </Button>
      ))}

      {/* Last Page */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-2 text-muted-foreground">...</span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(totalPages - 1)}
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* Next */}
      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={16} />
      </Button>

    </div>
  );
}