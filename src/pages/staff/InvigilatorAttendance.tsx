import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { seatApi, SeatEntry, SeatStatus, invigilatorApi } from "@/api/seatsApi";
import {
  Loader2,
  DoorOpen,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Hash,
  Users,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";

/* ────────────── Types ────────────── */

interface SessionSeatData {
  sessionId: number;
  seats: SeatEntry[];
}

interface SeatSlot {
  positionId: number;
  seatId: number | null;
  sessionId: number | null;
  status: SeatStatus | null;
  occupied: boolean;
}

interface StudentInfo {
  seatId: number;
  sessionId: number;
  regNo: number;
  status: SeatStatus;
}

/* ────────────── Status config ────────────── */

const STATUS_CONFIG: Record<SeatStatus, {
  bg: string; border: string; text: string; badge: string; glow: string; ring: string;
  label: string; icon: React.ElementType; dotColor: string;
}> = {
  ASSIGNED: {
    bg: "from-amber-400/20 to-yellow-500/10",
    border: "border-amber-400/50",
    text: "text-amber-800",
    badge: "bg-amber-500",
    glow: "shadow-amber-400/25",
    ring: "ring-amber-400/50",
    label: "Assigned",
    icon: Clock,
    dotColor: "bg-amber-400",
  },
  PRESENT: {
    bg: "from-emerald-400/20 to-green-500/10",
    border: "border-emerald-400/50",
    text: "text-emerald-800",
    badge: "bg-emerald-500",
    glow: "shadow-emerald-400/25",
    ring: "ring-emerald-400/50",
    label: "Present",
    icon: CheckCircle2,
    dotColor: "bg-emerald-400",
  },
  ABSENT: {
    bg: "from-red-400/20 to-rose-500/10",
    border: "border-red-400/50",
    text: "text-red-800",
    badge: "bg-red-500",
    glow: "shadow-red-400/25",
    ring: "ring-red-400/50",
    label: "Absent",
    icon: XCircle,
    dotColor: "bg-red-400",
  },
};

const SESSION_BADGE: Record<number, string> = {
  0: "bg-blue-500",
  1: "bg-indigo-500",
  2: "bg-purple-500",
};

function getSessionBadge(index: number) {
  return SESSION_BADGE[index % 3] ?? SESSION_BADGE[0];
}

/* ═══════════════════════════════════════════════ */
/*         INVIGILATOR ATTENDANCE PAGE            */
/* ═══════════════════════════════════════════════ */

const InvigilatorAttendance = () => {
  /* ── State ── */
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [sessionIds, setSessionIds] = useState<number[]>([]);
  const [assignmentDate, setAssignmentDate] = useState("");
  const [slotCode, setSlotCode] = useState("");

  const [sessionSeatData, setSessionSeatData] = useState<SessionSeatData[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedStudent, setSearchedStudent] = useState<StudentInfo | null>(null);

  const studentCache = useRef<Record<string, number>>({});
  const [activeTooltip, setActiveTooltip] = useState<{
    seatId: number; sessionId: number; regNo: number | null; loading: boolean; x: number; y: number;
  } | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ── Load assignment ── */
  useEffect(() => {
    loadAssignment();
  }, []);

  const loadAssignment = async () => {
    try {
      setLoading(false);
      // Set fixed values
      setRoomId(6);
      setSessionIds([7, 8, 9]);
      const today = new Date().toISOString().split("T")[0];
      setAssignmentDate(today);
      setSlotCode("S1");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load assignment.");
      setLoading(false);
    }
  };

  /* ── Load seats when assignment is ready ── */
  useEffect(() => {
    if (roomId && sessionIds.length > 0) {
      fetchSeats();
    }
  }, [roomId, sessionIds]);

  const fetchSeats = async () => {
    if (!roomId) return;
    setSeatsLoading(true);
    try {
      const results = await Promise.all(
        sessionIds.map(async (sid) => {
          const seats = await seatApi.getSeatsByRoom(roomId, sid);
          return { sessionId: sid, seats } as SessionSeatData;
        }),
      );
      setSessionSeatData(results);

      // Fetch all student register numbers for the attendance list
      const studentPromises: Promise<StudentInfo | null>[] = [];
      for (const ssd of results) {
        for (const seat of ssd.seats) {
          studentPromises.push(
            seatApi.getStudentBySeat(seat.seatId, ssd.sessionId)
              .then((regNo) => {
                studentCache.current[`${seat.seatId}_${ssd.sessionId}`] = regNo;
                return { seatId: seat.seatId, sessionId: ssd.sessionId, regNo, status: seat.status } as StudentInfo;
              })
              .catch(() => null),
          );
        }
      }
      const studentResults = (await Promise.all(studentPromises)).filter(Boolean) as StudentInfo[];
      setStudents(studentResults);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load seat data");
    } finally {
      setSeatsLoading(false);
    }
  };

  /* ── Room grid ── */
  const roomGrid = useMemo(() => {
    const empty = { slots: [] as SeatSlot[], benches: [] as SeatSlot[][], columns: [[], [], []] as SeatSlot[][][] };
    if (sessionSeatData.length === 0) return empty;

    const seatLookup: Record<number, { sessionId: number; status: SeatStatus }> = {};
    for (const ssd of sessionSeatData) {
      for (const entry of ssd.seats) {
        seatLookup[entry.seatId] = { sessionId: ssd.sessionId, status: entry.status };
      }
    }

    const allIds = Object.keys(seatLookup).map(Number);
    if (allIds.length === 0) return empty;
    const minId = Math.min(...allIds);
    const maxId = Math.max(...allIds);

    const slots: SeatSlot[] = [];
    for (let i = 0; i <= maxId - minId; i++) {
      const posId = minId + i;
      const info = seatLookup[posId] ?? null;
      slots.push({
        positionId: posId,
        seatId: info ? posId : null,
        sessionId: info?.sessionId ?? null,
        status: info?.status ?? null,
        occupied: !!info,
      });
    }

    const benches: SeatSlot[][] = [];
    for (let i = 0; i < slots.length; i += 3) benches.push(slots.slice(i, i + 3));

    const columns: SeatSlot[][][] = [[], [], []];
    benches.forEach((b, i) => columns[i % 3].push(b));

    return { slots, benches, columns };
  }, [sessionSeatData]);

  const statusCounts = useMemo(() => {
    const c = { ASSIGNED: 0, PRESENT: 0, ABSENT: 0 };
    for (const s of students) c[s.status]++;
    return c;
  }, [students]);

  /* ── Mark attendance ── */
  const handleMarkAttendance = async (student: StudentInfo) => {
    if (!roomId) return;
    const key = `${student.seatId}_${student.sessionId}`;
    setMarkingId(key);

    try {
      // Use correct API: /v1/invigilator/attendance?roomId=6&studentId=12575&sessionId=7
      const result = await invigilatorApi.markAttendance(roomId, student.regNo, student.sessionId);
      toast.success("Attendance marked successfully");

      // Refresh seats data
      await fetchSeats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setMarkingId(null);
    }
  };

  /* ── Search handler ── */
  const handleSearch = (regNo: string) => {
    setSearchQuery(regNo);
    if (!regNo.trim()) {
      setSearchedStudent(null);
      return;
    }
    const found = students.find(s => String(s.regNo) === regNo.trim());
    if (found) {
      setSearchedStudent(found);
      // Scroll to the searched student in the list
      setTimeout(() => {
        const element = document.getElementById(`student-${found.regNo}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      setSearchedStudent(null);
      toast.error("Student not found");
    }
  };

  /* ── Tooltip handlers ── */
  const getRelativePos = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const container = scrollRef.current;
    const containerRect = container?.getBoundingClientRect();
    const scrollTop = container?.scrollTop ?? 0;
    return {
      x: rect.left - (containerRect?.left ?? 0) + rect.width / 2,
      y: rect.top - (containerRect?.top ?? 0) + scrollTop - 10,
    };
  }, []);

  const handleSeatHover = useCallback((seatId: number, sessionId: number, e: React.MouseEvent) => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    const { x, y } = getRelativePos(e);
    const key = `${seatId}_${sessionId}`;
    const cached = studentCache.current[key];
    setActiveTooltip({ seatId, sessionId, regNo: cached ?? null, loading: !cached, x, y });
    if (!cached) {
      seatApi.getStudentBySeat(seatId, sessionId).then((regNo) => {
        studentCache.current[key] = regNo;
        setActiveTooltip((prev) =>
          prev && prev.seatId === seatId ? { ...prev, regNo, loading: false } : prev,
        );
      }).catch(() => {
        setActiveTooltip((prev) =>
          prev && prev.seatId === seatId ? { ...prev, loading: false } : prev,
        );
      });
    }
  }, [getRelativePos]);

  const handleSeatLeave = useCallback(() => {
    tooltipTimer.current = setTimeout(() => setActiveTooltip(null), 250);
  }, []);

  /* ═══════════════  RENDER  ════════════════ */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 relative" />
          </div>
          <span className="text-sm text-slate-500 font-medium">Loading your assignment…</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              Exam Attendance
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Room {roomId} · {assignmentDate} · Slot {slotCode}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search Register No..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />
            <button
              onClick={fetchSeats}
              disabled={seatsLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-sm font-medium text-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${seatsLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{students.length}</p>
                <p className="text-xs text-blue-500 font-medium">Total Students</p>
              </div>
            </div>
          </div>
          {(["PRESENT", "ASSIGNED", "ABSENT"] as SeatStatus[]).map((st) => {
            const cfg = STATUS_CONFIG[st];
            const Icon = cfg.icon;
            return (
              <div key={st} className={`p-4 rounded-2xl bg-gradient-to-br ${cfg.bg} border ${cfg.border}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${cfg.badge}/10`}>
                    <Icon className={`h-5 w-5 ${cfg.text}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${cfg.text}`}>{statusCounts[st]}</p>
                    <p className={`text-xs ${cfg.text} font-medium opacity-70`}>{cfg.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Two-panel layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Room Layout (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Panel header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DoorOpen className="h-5 w-5 text-slate-600" />
                  <h2 className="font-semibold text-slate-800">Room Layout</h2>
                </div>
                <div className="flex gap-2">
                  {(["ASSIGNED", "PRESENT", "ABSENT"] as SeatStatus[]).map((st) => (
                    <div key={st} className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                      <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[st].dotColor}`} />
                      {STATUS_CONFIG[st].label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Room view */}
              <div ref={scrollRef} className="p-5 overflow-y-auto relative" style={{ maxHeight: "65vh" }}>
                {seatsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <>
                    {/* Tooltip */}
                    {activeTooltip && (
                      <div
                        className="absolute z-50 pointer-events-none"
                        style={{ left: activeTooltip.x, top: activeTooltip.y, transform: "translate(-50%, -100%)" }}
                      >
                        <div className="bg-slate-900 text-white rounded-xl px-4 py-2.5 shadow-2xl border border-white/10 min-w-[130px]">
                          {activeTooltip.loading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                              <span className="text-xs text-slate-300">Loading…</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Reg No.</span>
                              <span className="text-base font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                                {activeTooltip.regNo ?? "N/A"}
                              </span>
                              <span className="text-[9px] text-slate-500">Seat {activeTooltip.seatId}</span>
                            </div>
                          )}
                          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-white/10" />
                        </div>
                      </div>
                    )}

                    {/* Blackboard */}
                    <div className="w-full h-8 rounded-lg bg-gradient-to-r from-green-800 via-green-700 to-green-800 mb-5 flex items-center justify-center shadow-md">
                      <span className="text-white/60 text-[10px] font-medium tracking-[0.2em] uppercase">Blackboard</span>
                    </div>

                    {/* Benches */}
                    <div className="grid grid-cols-3 gap-4">
                      {roomGrid.columns.map((column, colIdx) => (
                        <div key={colIdx} className="flex flex-col gap-2">
                          <div className="text-center text-[9px] font-semibold text-slate-400 uppercase tracking-widest pb-0.5 border-b border-dashed border-slate-200">
                            Col {colIdx + 1}
                          </div>
                          {column.map((bench, benchIdx) => (
                            <div key={benchIdx} className="flex items-stretch gap-1">
                              <div className="flex items-center justify-center w-5 flex-shrink-0">
                                <span className="text-[8px] font-bold text-slate-300">R{benchIdx + 1}</span>
                              </div>
                              <div className="flex-1 bg-gradient-to-b from-amber-100/80 to-amber-200/50 rounded-lg border border-amber-300/30 shadow-sm">
                                <div className="grid grid-cols-3 gap-1 p-1.5">
                                  {bench.map((slot) => {
                                    if (!slot.occupied) {
                                      return (
                                        <div key={slot.positionId} className="flex flex-col items-center justify-center h-[50px] rounded-md border border-dashed border-slate-300/40 bg-white/30">
                                          <span className="text-[8px] text-slate-300">{slot.positionId}</span>
                                        </div>
                                      );
                                    }

                                    const st = STATUS_CONFIG[slot.status!];
                                    const isActive = activeTooltip?.seatId === slot.seatId;
                                    const cached = studentCache.current[`${slot.seatId}_${slot.sessionId}`];
                                    const isSearchedSeat = searchedStudent?.seatId === slot.seatId && searchedStudent?.sessionId === slot.sessionId;
                                    const seatStudent = students.find(s => s.seatId === slot.seatId && s.sessionId === slot.sessionId);
                                    const shouldShowRegNo = seatStudent?.status === "PRESENT";

                                    return (
                                      <div
                                        key={slot.positionId}
                                        className={`relative flex flex-col items-center justify-center h-[50px] rounded-md cursor-pointer
                                          bg-gradient-to-b ${st.bg} border ${st.border}
                                          transition-all duration-200 hover:scale-105 hover:shadow-md ${st.glow}
                                          ${isActive ? `scale-105 shadow-md ring-2 ring-offset-1 ${st.ring}` : ""}
                                          ${isSearchedSeat ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg" : ""}
                                        `}
                                        onMouseEnter={(e) => handleSeatHover(slot.seatId!, slot.sessionId!, e)}
                                        onMouseLeave={handleSeatLeave}
                                      >
                                        <User className={`h-2.5 w-2.5 ${st.text} mb-0.5`} />
                                        <span className={`text-[9px] font-bold ${st.text}`}>{slot.seatId}</span>
                                        {isSearchedSeat && searchedStudent?.status === "PRESENT" && (
                                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-[9px] font-bold text-white bg-blue-600 px-1.5 py-1 rounded-full shadow-md">
                                            {searchedStudent.regNo}
                                          </span>
                                        )}
                                        {cached && !isSearchedSeat && shouldShowRegNo && (
                                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 text-[7px] font-bold text-white bg-slate-700/90 px-1 py-[1px] rounded-full shadow">
                                            {cached}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Attendance List (2 cols) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-slate-600" />
                  <h2 className="font-semibold text-slate-800">Attendance</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {statusCounts.PRESENT}/{students.length} present
                </span>
              </div>

              {/* Progress bar */}
              <div className="px-5 pt-3 pb-2">
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full flex">
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{ width: students.length ? `${(statusCounts.PRESENT / students.length) * 100}%` : "0%" }}
                    />
                    <div
                      className="bg-red-500 transition-all duration-500"
                      style={{ width: students.length ? `${(statusCounts.ABSENT / students.length) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Student list */}
              <div className="overflow-y-auto" style={{ maxHeight: "55vh" }}>
                {seatsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-sm">No students found</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {students.map((student) => {
                      const st = STATUS_CONFIG[student.status];
                      const Icon = st.icon;
                      const key = `${student.seatId}_${student.sessionId}`;
                      const isMarking = markingId === key;
                      const isSearched = searchedStudent?.seatId === student.seatId && searchedStudent?.sessionId === student.sessionId;

                      return (
                        <div 
                          id={`student-${student.regNo}`}
                          key={key} 
                          className={`px-5 py-3 flex items-center gap-3 transition-all group ${
                            isSearched 
                              ? "bg-blue-50 border-l-4 border-l-blue-500 shadow-sm" 
                              : "hover:bg-slate-50/80"
                          }`}
                        >
                          {/* Status indicator */}
                          <div className={`p-1.5 rounded-lg ${st.badge}/10 flex-shrink-0`}>
                            <Icon className={`h-4 w-4 ${st.text}`} />
                          </div>

                          {/* Student info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {student.status !== "PRESENT" && (
                                <>
                                  {isSearched && (
                                    <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">
                                      {student.regNo}
                                    </span>
                                  )}
                                  {!isSearched && (
                                    <span className="text-sm font-bold text-slate-800">---</span>
                                  )}
                                </>
                              )}
                              <span className={`text-[9px] font-semibold text-white px-1.5 py-0.5 rounded-full ${st.badge}`}>
                                {st.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Hash className="h-2.5 w-2.5" />
                                Seat {student.seatId}
                              </span>
                              <span>· S{student.sessionId}</span>
                            </div>
                          </div>

                          {/* Action button */}
                          {student.status === "ASSIGNED" && (
                            <button
                              onClick={() => handleMarkAttendance(student)}
                              disabled={isMarking}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm shadow-emerald-500/25 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isMarking ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              Mark Present
                            </button>
                          )}

                          {student.status === "PRESENT" && (
                            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Done
                            </div>
                          )}

                          {student.status === "ABSENT" && (
                            <button
                              onClick={() => handleMarkAttendance(student)}
                              disabled={isMarking}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                            >
                              {isMarking ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}
                              Re-mark
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes inv-fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default InvigilatorAttendance;
