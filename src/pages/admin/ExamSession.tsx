import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

import { examSessionApi, ExamSession, createExamSession } from "@/api/examApis";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card } from "@/components/ui/card";
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Loader2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

const ExamSessions = () => {
  const { examId } = useParams();

  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<createExamSession>({
    examId: Number(examId),
    subjectCode: "",
    date: "",
    year: undefined,
    slotCode: "",
    startTime: "",
    endTime: "",
    partNo: undefined,
  });

  const SLOT_TIMINGS: Record<string, { start: string; end: string }> = {
    S1: { start: "09:00", end: "10:30" },
    S2: { start: "11:00", end: "12:30" },
    S3: { start: "13:00", end: "14:30" },
    S4: { start: "15:00", end: "16:30" },
  };

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await examSessionApi.getAllExamSession(Number(examId));
      setSessions(data);
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GROUP LOGIC ---------------- */

  const groupedSessions = useMemo(() => {
    const map: Record<string, ExamSession[]> = {};

    sessions.forEach((s) => {
      const key = `${s.date}_${s.startTime}_${s.endTime}_${s.slotCode}`;

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(s);
    });

    return map;
  }, [sessions]);

  /* ---------------- CREATE ---------------- */

  const handleCreate = async () => {
    if (!form.date || !form.slotCode) {
      toast.error("Fill required fields");
      return;
    }

    try {
      await examSessionApi.createExamSession(form);

      toast.success("Session created");

      setOpen(false);

      setForm({
        examId: Number(examId),
        subjectCode: "",
        date: "",
        slotCode: "",
        year: undefined,
        startTime: "",
        endTime: "",
        partNo: undefined,
      });

      fetchSessions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Exam Sessions (Exam ID: {examId})
          </h1>

          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Exams
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : Object.keys(groupedSessions).length === 0 ? (
          <Card className="p-6 text-center">No sessions found</Card>
        ) : (
          Object.entries(groupedSessions).map(([key, group]) => {
            const [date, start, end, slotCode] = key.split("_");

            return (
              <Card key={key} className="p-6">
                {/* 🔥 HEADER BOX (WHAT YOU WANTED) */}
                <div className="mb-4 p-4 bg-gray-100 rounded-lg flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">Exam Date: {date}</h2>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Slot: {slotCode}</h2>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      Timings: {start} - {end}
                    </h2>
                  </div>

                  <div className="text-sm text-gray-500">
                    Total Subjects: {group.length}
                  </div>
                </div>

                {/* TABLE */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session Id</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Part</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {group.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell  >{s.sessionId}</TableCell>
                        <TableCell>{s.subject_title}</TableCell>
                        <TableCell>{s.subject_code}</TableCell>
                        <TableCell>{s.year || "-"}</TableCell>
                        <TableCell>{s.partNo || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            );
          })
        )}
      </div>

      {/* ---------------- DIALOG ---------------- */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exam</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input type="number" value={examId} disabled />
            <Input
              placeholder="Subject Code"
              value={form.subjectCode}
              onChange={(e) =>
                setForm({ ...form, subjectCode: e.target.value })
              }
            />

            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Part No (e.g., 1, 2)"
              value={form.partNo ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  partNo:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />

            {/* ✅ SLOT DROPDOWN */}
            <Select
              value={form.slotCode}
              onValueChange={(value) => {
                const timing = SLOT_TIMINGS[value];

                setForm({
                  ...form,
                  slotCode: value,
                  startTime: timing.start,
                  endTime: timing.end,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Slot" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="S1">S1 (09:00 - 10:30)</SelectItem>
                <SelectItem value="S2">S2 (11:00 - 12:30)</SelectItem>
                <SelectItem value="S3">S3 (13:00 - 14:30)</SelectItem>
                <SelectItem value="S4">S4 (15:00 - 16:30)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ExamSessions;
