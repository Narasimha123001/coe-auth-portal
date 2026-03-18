import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

import { subjectsApi, Subject } from "@/api/subjectsApi";
import { departmentsApi, Department } from "@/api/departmentsApi";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

/* ---------------- COMPONENT ---------------- */

const Subjects = () => {

  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filtered, setFiltered] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    deptId: "",
    year: "1",
    semester: "1",
  });

  /* ---------------- SEMESTER LOGIC ---------------- */

  const getSemestersByYear = (year: number) => {
    switch (year) {
      case 1: return [1, 2];
      case 2: return [3, 4];
      case 3: return [5, 6];
      case 4: return [7, 8];
      default: return [];
    }
  };

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      setLoading(true);

      const deptData = await departmentsApi.getDepartments();
      setDepartments(deptData);

      if (deptData.length > 0) {
        const firstDeptId = String(deptData[0].deptId);

        // ✅ Set default filters
        setFilters({
          deptId: firstDeptId,
          year: "1",
          semester: "1",
        });

        // ✅ Fetch subjects
        const subData = await subjectsApi.getSubjectsByDepartment(Number(firstDeptId));
        setSubjects(subData);
        setFiltered(subData);
      }

    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FETCH SUBJECTS ---------------- */

  const fetchSubjects = async (deptId: string) => {
    try {
      setLoading(true);

      const data = await subjectsApi.getSubjectsByDepartment(Number(deptId));
      setSubjects(data);
      setFiltered(data);

    } catch {
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER LOGIC ---------------- */

  useEffect(() => {

    let data = [...subjects];

    if (filters.year) {
      data = data.filter(s => s.year === Number(filters.year));
    }

    if (filters.semester) {
      data = data.filter(s => s.semester === Number(filters.semester));
    }

    setFiltered(data);

  }, [filters.year, filters.semester, subjects]);

  /* ---------------- UI ---------------- */

  return (
    <DashboardLayout>

      <div className="space-y-6">

        <Card className="p-6">

          <h2 className="text-2xl font-semibold mb-6">
            Subjects Management
          </h2>

          {/* ---------------- FILTERS ---------------- */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

            {/* Department */}
            <Select
              value={filters.deptId}
              onValueChange={(value) => {
                setFilters({
                  deptId: value,
                  year: "1",
                  semester: "1",
                });
                fetchSubjects(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>

              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.deptId} value={String(d.deptId)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year */}
            <Select
              value={filters.year}
              onValueChange={(value) => {
                const year = Number(value);
                const semesters = getSemestersByYear(year);

                setFilters({
                  ...filters,
                  year: value,
                  semester: String(semesters[0]),
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>

              <SelectContent>
                {[1, 2, 3, 4].map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    Year {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Semester */}
            <Select
              value={filters.semester}
              onValueChange={(value) =>
                setFilters({ ...filters, semester: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semester" />
              </SelectTrigger>

              <SelectContent>
                {getSemestersByYear(Number(filters.year)).map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    Semester {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>

          {/* ---------------- TABLE ---------------- */}

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : (

            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Semester</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No subjects found
                    </TableCell>
                  </TableRow>
                ) : (

                  filtered.map((sub, i) => (
                    <TableRow key={i}>
                      <TableCell>{sub.subjectCode}</TableCell>
                      <TableCell>{sub.title}</TableCell>
                      <TableCell>{sub.year}</TableCell>
                      <TableCell>{sub.semester}</TableCell>
                    </TableRow>
                  ))

                )}

              </TableBody>

            </Table>

          )}

        </Card>

      </div>

    </DashboardLayout>
  );
};

export default Subjects;