import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

import { examApi, Exam } from "@/api/examApis";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Loader2, Plus } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "react-hot-toast";

/* ---------------- ENUM OPTIONS ---------------- */

const EXAM_TYPES = ["MID", "SEM", "PRACTICAL", "SESS"];

/* ---------------- COMPONENT ---------------- */

const Exams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<Exam>({
    name: "",
    examType: "",
    startDate: "",
    endDate: "",
  });

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const data = await examApi.getAllExams();
      setExams(data);
    } catch {
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CREATE / UPDATE ---------------- */

  const handleSubmit = async () => {
    if (!form.name || !form.examType || !form.startDate || !form.endDate) {
      toast.error("All fields required");
      return;
    }

    try {
      if (editing && form.examId) {
        await examApi.updateExam(form);
        toast.success("Exam updated successfully");
      } else {
        await examApi.createExam(form);
        toast.success("Exam created successfully");
      }

      setOpen(false);
      setEditing(false);

      setForm({
        name: "",
        examType: "",
        startDate: "",
        endDate: "",
      });

      fetchExams();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  /* ---------------- EDIT ---------------- */

  const handleEdit = (exam: Exam) => {
    setEditing(true);
    setForm(exam);
    setOpen(true);
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (examId: number) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {
      await examApi.deleteExam(examId);
      toast.success("Exam deleted");
      fetchExams();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Exam Management</h2>

            <Button
              onClick={() => {
                setEditing(false);
                setForm({
                  name: "",
                  examType: "",
                  startDate: "",
                  endDate: "",
                });
                setOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Exam
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {exams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No exams found
                    </TableCell>
                  </TableRow>
                ) : (
                  exams.map((exam) => (
                    <TableRow key={exam.examId}>
                      <TableCell>{exam.name}</TableCell>
                      <TableCell>{exam.examType}</TableCell>
                      <TableCell>{exam.startDate}</TableCell>
                      <TableCell>{exam.endDate}</TableCell>
                      <TableCell>{exam.createdBy}</TableCell>

                      <TableCell className="text-right">
                        <div className="relative inline-block">
                          <details className="relative">
                            <summary className="list-none cursor-pointer">
                              <MoreVertical />
                            </summary>

                            <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow-md z-10">
                              <button
                                className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                                onClick={() => handleEdit(exam)}
                              >
                                Edit
                              </button>

                              <button
                                className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                                onClick={() => handleDelete(exam.examId!)}
                              >
                                Delete
                              </button>
                            </div>
                          </details>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* ---------------- DIALOG ---------------- */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Exam" : "Create Exam"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Exam Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <Select
              value={form.examType}
              onValueChange={(value) =>
                setForm({ ...form, examType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Exam Type" />
              </SelectTrigger>

              <SelectContent>
                {EXAM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
            />

            <Input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm({ ...form, endDate: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Exams;