import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortKey: string;
  sortOrder: string;
  onSort: (key: string) => void;
  renderActions?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  sortKey,
  sortOrder,
  onSort,
  renderActions,
}: DataTableProps<T>) {
  return (
    <div className="rounded-xl border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={String(col.accessor)}
                onClick={() =>
                  col.sortable && onSort(String(col.accessor))
                }
                className={col.sortable ? "cursor-pointer select-none" : ""}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {sortKey === col.accessor && (
                    sortOrder === "asc" ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )
                  )}
                </div>
              </TableHead>
            ))}
            {renderActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell key={String(col.accessor)}>
                  {String(row[col.accessor] ?? "-")}
                </TableCell>
              ))}
              {renderActions && (
                <TableCell className="text-right">
                  {renderActions(row)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}