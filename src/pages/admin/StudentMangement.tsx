import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { usersApi, Student } from "@/api/usersApi";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, MoreVertical } from "lucide-react";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { DataTableSkeleton } from "@/components/data-table/DataTableSkeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

const StudentManagement = () => {

  const [students, setStudents] = useState<Student[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("registerNo");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const sort = `${sortKey},${sortOrder}`;
      const data = await usersApi.getAll(page, size, search, sort);

      setStudents(data.content);
      setTotalPages(data?.page?.totalPages ?? 0);
      setTotalElements(data?.page?.totalElements ?? 0);
    } catch {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search, sortKey, sortOrder]);

  const handleSort = (key: string) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">

        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">
            Total Students: {totalElements}
          </p>
        </div>

        <Card className="p-6 space-y-6">

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search students..."
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
            />
          </div>

          {loading ? (
            <DataTableSkeleton />
          ) : (
            <>
              <DataTable<Student>
                columns={[
                  { header: "Register No", accessor: "registerNo", sortable: true },
                  { header: "Name", accessor: "name", sortable: true },
                  { header: "Email", accessor: "email", sortable: true },
                ]}
                data={students}
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
                renderActions={(row) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical size={18} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />

              <DataTablePagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentManagement;