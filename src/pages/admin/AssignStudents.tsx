import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "react-hot-toast";
import { Loader2, CheckCircle } from "lucide-react";
import {studentSessionApi} from "@/api/StudentSession"

const AssignStudents = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : null;
const deptId = searchParams.get("deptId") ? Number(searchParams.get("deptId")) : null;

  const [students, setStudents] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH ---------------- */
useEffect(() => {
  if (year !== null && deptId !== null) {
    fetchStudents();
  }
}, [year, deptId]);
const fetchStudents = async () => {
  if (year === null || deptId === null) {
    toast.error("Invalid params");
    return;
  }

  setLoading(true);
  try {
    const data = await studentSessionApi.getStudentsByYear(deptId, year);
    setStudents(data);
    setSelected(data);
  } catch {
    toast.error("Failed to load students");
  } finally {
    setLoading(false);
  }
};

  /* ---------------- FILTER ---------------- */
  const filteredStudents = students.filter((id) =>
    id.toString().includes(search)
  );

  /* ---------------- TOGGLE ---------------- */
  const toggleStudent = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  /* ---------------- ASSIGN ---------------- */
  const handleAssign = async () => {
    try {
      const res = await studentSessionApi.assignStudents({
        sessionId: Number(sessionId),
        registrationIds: selected,
      });

      toast.success(
        `${res.registrationNo.length} success, ${res.failed.length} failed`
      );

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Assign Students
            </h1>
            <p className="text-sm text-gray-500">
              Session ID: {sessionId} • Year: {year} • DeptId: {deptId} 
            </p>
          </div>

          <Button onClick={handleAssign} className="gap-2">
            <CheckCircle size={16} />
            Assign ({selected.length})
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl shadow">
            <p className="text-sm text-gray-500">Total Students</p>
            <h2 className="text-xl font-bold">{students.length}</h2>
          </div>

          <div className="p-4 bg-white rounded-xl shadow">
            <p className="text-sm text-gray-500">Selected</p>
            <h2 className="text-xl font-bold">{selected.length}</h2>
          </div>

          <div className="p-4 bg-white rounded-xl shadow">
            <p className="text-sm text-gray-500">Unselected</p>
            <h2 className="text-xl font-bold">
              {students.length - selected.length}
            </h2>
          </div>
        </div>

        {/* SEARCH */}
        <Input
          placeholder="Search student ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* STUDENT GRID */}
        <div className="bg-white p-4 rounded-xl shadow max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">

              {filteredStudents.map((id) => (
                <div
                  key={id}
                  onClick={() => toggleStudent(id)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition
                    ${
                      selected.includes(id)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }
                  `}
                >
                  {id}
                </div>
              ))}

            </div>
          )}
        </div>

        {/* ACTION BAR */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={fetchStudents}>
            Refresh Eligible
          </Button>

          <Button onClick={handleAssign}>
            Assign Students
          </Button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AssignStudents;