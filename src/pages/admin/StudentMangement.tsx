import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { usersApi, Student } from "@/api/usersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Search, Loader2, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  /* ================= FETCH ================= */

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await usersApi.getAll(page, size);
      setStudents(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      toast.error("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page]);

  /* ================= SEARCH ================= */

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registerNo.toString().includes(searchTerm)
    );
  }, [students, searchTerm]);

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Student Management
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage and monitor registered students
            </p>
          </div>

          <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              Total Students: {totalElements}
            </span>
          </div>
        </div>

        {/* MAIN CARD */}
        <Card className="p-6 shadow-sm border border-muted">

          {/* SEARCH BAR */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or register number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* LOADING */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* TABLE */}
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Register No</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-16 text-muted-foreground"
                        >
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow
                          key={student.registerNo}
                          className="hover:bg-muted/30 transition"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                {(student.name || student.email)
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {student.name || "Unnamed"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Student ID
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="font-medium">
                            {student.registerNo}
                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {student.email}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* PAGINATION */}
              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="text-sm text-muted-foreground">
                  Page <span className="font-medium">{page + 1}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentManagement;