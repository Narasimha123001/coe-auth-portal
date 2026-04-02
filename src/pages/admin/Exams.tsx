import React, { useRef, useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

import { useNavigate } from "react-router-dom";
import { examApi, Exam } from "@/api/examApis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Trash2,
  Settings2,
  Loader2,
  Plus,
  BookOpen,
  MoreVertical,
  CalendarDays,
  User,
} from "lucide-react";

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

/* ---------------- CONSTANTS ---------------- */

const EXAM_TYPES = ["MID", "SEM", "PRACTICAL", "SESS"];

const TYPE_STYLES: Record<string, string> = {
  MID:       "bg-blue-50    text-blue-700    ring-blue-200",
  SEM:       "bg-violet-50  text-violet-700  ring-violet-200",
  PRACTICAL: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  SESS:      "bg-amber-50   text-amber-700   ring-amber-200",
};

interface MenuPos { top: number; left: number }

/* ---------------- COMPONENT ---------------- */

const Exams = () => {
  const [exams,      setExams]      = useState<Exam[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos,    setMenuPos]    = useState<MenuPos>({ top: 0, left: 0 });
  const dropdownRef                 = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [open,    setOpen]    = useState(false);
  const [form,    setForm]    = useState<Exam>({
    name: "", examType: "", startDate: "", endDate: "",
  });

  /* ── fetch ── */
  useEffect(() => { fetchExams(); }, []);

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

  /* ── close on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── close on scroll / resize ── */
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, []);

  /* ── open menu pinned to the trigger button ── */
  const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>, examId: number) => {
    if (openMenuId === examId) { setOpenMenuId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top:  rect.bottom + 6,
      left: rect.right - 144,   // 144px = w-36
    });
    setOpenMenuId(examId);
  };

  /* ── submit ── */
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
      setForm({ name: "", examType: "", startDate: "", endDate: "" });
      fetchExams();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditing(true);
    setForm(exam);
    setOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (examId: number) => {
    setOpenMenuId(null);
    if (!confirm("Are you sure you want to delete this exam?")) return;
    try {
      await examApi.deleteExam(examId);
      toast.success("Exam deleted");
      fetchExams();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 p-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-md shadow-indigo-200">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">Exams Time-Table</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {exams.length} exam{exams.length !== 1 ? "s" : ""} configured
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditing(false);
              setForm({ name: "", examType: "", startDate: "", endDate: "" });
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            Create Exam Time-Lines
          </button>
        </div>

        {/* ── Table — NO overflow-hidden so fixed dropdown isn't clipped ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
              <span className="text-sm">Loading exams…</span>
            </div>
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
              <BookOpen className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">No exams found</p>
              <p className="text-xs text-slate-300">Create your first exam to get started</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider rounded-tl-2xl">Name</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Start Date</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">End Date</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-3.5 rounded-tr-2xl w-14" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {exams.map((exam) => (
                  <tr key={exam.examId} className="hover:bg-slate-50/70 transition-colors duration-100">

                    <td className="px-6 py-4 font-semibold text-slate-800">{exam.name}</td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${TYPE_STYLES[exam.examType] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                        {exam.examType}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        {exam.startDate}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        {exam.endDate}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="w-3 h-3 text-indigo-600" />
                        </div>
                        <span className="text-slate-600">{exam.createdBy}</span>
                      </div>
                    </td>

                    {/* ⋮ trigger — uses getBoundingClientRect to anchor the fixed menu */}
                    <td className="px-4 py-4 w-14">
                      <button
                        onClick={(e) => handleOpenMenu(e, exam.examId!)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Floating dropdown — rendered outside table, position:fixed ── */}
      {openMenuId !== null && (
        <div
          ref={dropdownRef}
          style={{ position: "fixed", top: menuPos.top, left: menuPos.left }}
          className="w-36 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-300/60 z-[9999] overflow-hidden py-1"
        >
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => {
              const exam = exams.find((e) => e.examId === openMenuId)!;
              handleEdit(exam);
            }}
          >
            <Pencil className="w-3.5 h-3.5 text-slate-400" />
            Edit
          </button>

          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => {
              navigate(`/admin/exams/${openMenuId}/sessions`);
            }}
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-400" />
            Manage
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => handleDelete(openMenuId!)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}

      {/* ── Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-indigo-600" />
              </div>
              {editing ? "Edit Exam" : "Create New Exam"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Exam Name</label>
              <Input
                placeholder="e.g. Sessional Exam 1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Exam Type</label>
              <Select value={form.examType} onValueChange={(v) => setForm({ ...form, examType: v })}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {EXAM_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Start Date</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">End Date</label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200">
              {editing ? "Update Exam" : "Create Exam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Exams;