import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { seatApi, RoomsResponse, SeatEntry, SeatStatus } from "@/api/seatsApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, DoorOpen, User, Hash } from "lucide-react";

/* ────────────── Types ────────────── */

interface RoomViewModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  date: string;
  slotCode: string;
}

interface SessionSeatData {
  sessionId: number;
  seats: SeatEntry[];
}

/** A single seat position in the room grid */
interface SeatSlot {
  positionId: number;
  seatId: number | null;
  sessionId: number | null;
  status: SeatStatus | null;
  occupied: boolean;
}

/* ────────────── Status-based colors ────────────── */

const STATUS_STYLES: Record<SeatStatus, {
  bg: string; border: string; text: string; badge: string; glow: string; ring: string; label: string;
}> = {
  ASSIGNED: {
    bg: "from-amber-400/20 to-yellow-500/10",
    border: "border-amber-400/50",
    text: "text-amber-800",
    badge: "bg-amber-500",
    glow: "shadow-amber-400/25",
    ring: "ring-amber-400/50",
    label: "Assigned",
  },
  PRESENT: {
    bg: "from-emerald-400/20 to-green-500/10",
    border: "border-emerald-400/50",
    text: "text-emerald-800",
    badge: "bg-emerald-500",
    glow: "shadow-emerald-400/25",
    ring: "ring-emerald-400/50",
    label: "Present",
  },
  ABSENT: {
    bg: "from-red-400/20 to-rose-500/10",
    border: "border-red-400/50",
    text: "text-red-800",
    badge: "bg-red-500",
    glow: "shadow-red-400/25",
    ring: "ring-red-400/50",
    label: "Absent",
  },
};

/* ────────────── Session badge colors ────────────── */

const SESSION_BADGE_COLORS: Record<number, string> = {
  0: "bg-blue-500",
  1: "bg-indigo-500",
  2: "bg-purple-500",
};

function getSessionBadge(index: number) {
  return SESSION_BADGE_COLORS[index % 3] ?? SESSION_BADGE_COLORS[0];
}

/* ═══════════════════════════════════════════════════════════ */
/*                     MAIN  COMPONENT                        */
/* ═══════════════════════════════════════════════════════════ */

const RoomViewModal: React.FC<RoomViewModalProps> = ({
  open,
  onOpenChange,
  date,
  slotCode,
}) => {
  /* ── Core state ── */
  const [loading, setLoading] = useState(false);
  const [roomsData, setRoomsData] = useState<RoomsResponse | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [sessionSeatData, setSessionSeatData] = useState<SessionSeatData[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);

  /* ── Tooltip state ── */
  const [activeTooltip, setActiveTooltip] = useState<{
    seatId: number;
    sessionId: number;
    regNo: number | null;
    loading: boolean;
    x: number;
    y: number;
  } | null>(null);

  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const studentCache = useRef<Record<string, number>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ───────────── Sorted rooms ───────────── */
  const sortedRoomIds = useMemo(() => {
    if (!roomsData) return [];
    return [...roomsData.roomId].sort((a, b) => a - b);
  }, [roomsData]);

  /* ───────────── Fetch rooms ───────────── */
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelectedRoom(null);
    setSessionSeatData([]);
    setRoomsData(null);
    studentCache.current = {};

    seatApi
      .getRoomsByDateAndSlot(date, slotCode)
      .then((data) => setRoomsData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, date, slotCode]);

  /* ───────────── Fetch seats concurrently ───────────── */
  const handleRoomClick = useCallback(
    async (roomId: number) => {
      if (!roomsData) return;
      setSelectedRoom(roomId);
      setSeatsLoading(true);
      setSessionSeatData([]);
      setActiveTooltip(null);

      try {
        const results = await Promise.all(
          roomsData.sessionId.map(async (sid) => {
            const seats = await seatApi.getSeatsByRoom(roomId, sid);
            return { sessionId: sid, seats } as SessionSeatData;
          }),
        );
        setSessionSeatData(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSeatsLoading(false);
      }
    },
    [roomsData],
  );

  /* ─────────────────────────────────────────────────
   *  Build the ROOM GRID with status
   * ───────────────────────────────────────────────── */
  const roomGrid = useMemo(() => {
    const empty = { slots: [] as SeatSlot[], benches: [] as SeatSlot[][], columns: [[], [], []] as SeatSlot[][][] };
    if (sessionSeatData.length === 0) return empty;

    // Build lookup: seatId → { sessionId, status }
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
    const totalPositions = maxId - minId + 1;

    const slots: SeatSlot[] = [];
    for (let i = 0; i < totalPositions; i++) {
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
    for (let i = 0; i < slots.length; i += 3) {
      benches.push(slots.slice(i, i + 3));
    }

    const columns: SeatSlot[][][] = [[], [], []];
    benches.forEach((bench, i) => {
      columns[i % 3].push(bench);
    });

    return { slots, benches, columns };
  }, [sessionSeatData]);

  /* ── Status counts ── */
  const statusCounts = useMemo(() => {
    const counts = { ASSIGNED: 0, PRESENT: 0, ABSENT: 0, empty: 0 };
    for (const s of roomGrid.slots) {
      if (!s.occupied) counts.empty++;
      else if (s.status) counts[s.status]++;
    }
    return counts;
  }, [roomGrid]);

  /* ───────────── Student fetch (hover / click) ───────────── */
  const fetchStudent = useCallback(
    async (seatId: number, sessionId: number, x: number, y: number) => {
      const key = `${seatId}_${sessionId}`;
      if (studentCache.current[key] !== undefined) {
        setActiveTooltip({ seatId, sessionId, regNo: studentCache.current[key], loading: false, x, y });
        return;
      }
      setActiveTooltip({ seatId, sessionId, regNo: null, loading: true, x, y });
      try {
        const regNo = await seatApi.getStudentBySeat(seatId, sessionId);
        studentCache.current[key] = regNo;
        setActiveTooltip((prev) =>
          prev && prev.seatId === seatId && prev.sessionId === sessionId
            ? { ...prev, regNo, loading: false }
            : prev,
        );
      } catch {
        setActiveTooltip((prev) =>
          prev && prev.seatId === seatId ? { ...prev, regNo: null, loading: false } : prev,
        );
      }
    },
    [],
  );

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

  const handleSeatEnter = useCallback(
    (seatId: number, sessionId: number, e: React.MouseEvent) => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      const { x, y } = getRelativePos(e);
      fetchStudent(seatId, sessionId, x, y);
    },
    [fetchStudent, getRelativePos],
  );

  const handleSeatLeave = useCallback(() => {
    tooltipTimer.current = setTimeout(() => setActiveTooltip(null), 250);
  }, []);

  const handleSeatClickEvt = useCallback(
    (seatId: number, sessionId: number, e: React.MouseEvent) => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      const { x, y } = getRelativePos(e);
      fetchStudent(seatId, sessionId, x, y);
    },
    [fetchStudent, getRelativePos],
  );

  /* ═══════════════  RENDER  ════════════════ */

  const occupiedTotal = roomGrid.slots.filter((s) => s.occupied).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl w-[95vw] max-h-[92vh] overflow-hidden p-0 border-0 bg-gradient-to-br from-slate-50 to-white shadow-2xl"
        ref={modalRef}
      >
        {/* ─── Sticky Glass Header ─── */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 px-6 py-4">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {selectedRoom && (
                <button
                  onClick={() => {
                    setSelectedRoom(null);
                    setSessionSeatData([]);
                    setActiveTooltip(null);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4 text-slate-600" />
                </button>
              )}
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {selectedRoom ? `Room ${selectedRoom} — Seating Layout` : "Available Exam Rooms"}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 mt-0.5">
                  {selectedRoom
                    ? `Hover or click a seat to reveal the student register number`
                    : `${date} · Slot ${slotCode} · ${sortedRoomIds.length} rooms`}
                </DialogDescription>
              </div>
            </div>

            {/* Legend */}
            {selectedRoom && sessionSeatData.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {/* Status legend */}
                {(["ASSIGNED", "PRESENT", "ABSENT"] as SeatStatus[]).map((st) => {
                  const s = STATUS_STYLES[st];
                  return (
                    <div key={st} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-medium">
                      <span className={`h-2.5 w-2.5 rounded-full ${s.badge}`} />
                      {s.label}
                      <span className="text-slate-400 ml-0.5">{statusCounts[st]}</span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-dashed border-slate-300 text-xs font-medium text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200 border border-dashed border-slate-300" />
                  Empty <span className="ml-0.5">{statusCounts.empty}</span>
                </div>
                {/* Session badges */}
                <div className="w-px bg-slate-200 mx-1" />
                {sessionSeatData.map((ssd, idx) => (
                  <div key={ssd.sessionId} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-medium">
                    <span className={`h-2.5 w-2.5 rounded-full ${getSessionBadge(idx)}`} />
                    S{ssd.sessionId}
                    <span className="text-slate-400">· {ssd.seats.length}</span>
                  </div>
                ))}
              </div>
            )}
          </DialogHeader>
        </div>

        {/* ─── Body ─── */}
        <div ref={scrollRef} className="overflow-y-auto px-6 pb-8 pt-2 relative" style={{ maxHeight: "calc(92vh - 130px)" }}>
          {/* ═══ LOADING ═══ */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 relative" />
              </div>
              <span className="text-sm text-slate-500 font-medium">Loading rooms…</span>
            </div>
          )}

          {/* ═══ ROOMS GRID (sorted) ═══ */}
          {!loading && !selectedRoom && roomsData && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              {sortedRoomIds.map((rid, i) => (
                <button
                  key={rid}
                  onClick={() => handleRoomClick(rid)}
                  className="group relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 active:scale-95"
                  style={{ animationDelay: `${i * 25}ms`, animation: "rv-fadeInUp 0.4s ease-out forwards", opacity: 0 }}
                >
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-300">
                    <DoorOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Room {rid}</span>
                </button>
              ))}
            </div>
          )}

          {/* ═══ SEATS LOADING ═══ */}
          {selectedRoom && seatsLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500 relative" />
              </div>
              <span className="text-sm text-slate-500 font-medium">Loading seating arrangement…</span>
            </div>
          )}

          {/* ═══ ROOM DETAIL ═══ */}
          {selectedRoom && !seatsLoading && sessionSeatData.length > 0 && (
            <>
              {/* Floating tooltip */}
              {activeTooltip && (
                <div
                  className="absolute z-50 pointer-events-none"
                  style={{ left: activeTooltip.x, top: activeTooltip.y, transform: "translate(-50%, -100%)" }}
                >
                  <div className="bg-slate-900 text-white rounded-xl px-4 py-2.5 shadow-2xl shadow-slate-900/40 border border-white/10 min-w-[140px]">
                    {activeTooltip.loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                        <span className="text-xs text-slate-300">Fetching…</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                          <User className="h-3 w-3" />
                          Register No.
                        </div>
                        <span className="text-lg font-bold tracking-wide bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                          {activeTooltip.regNo ?? "N/A"}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Hash className="h-2.5 w-2.5" />
                          Seat {activeTooltip.seatId} · Session {activeTooltip.sessionId}
                        </div>
                      </div>
                    )}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-white/10" />
                  </div>
                </div>
              )}

              {/* Room Container */}
              <div className="relative bg-gradient-to-b from-slate-100/80 to-slate-50 rounded-3xl border-2 border-slate-300/50 p-6 pt-8 pb-10 shadow-inner">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 text-white text-xs font-bold shadow-lg tracking-wider uppercase">
                  Classroom {selectedRoom}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-lg uppercase tracking-wider">
                  <DoorOpen className="h-3 w-3" />
                  Entrance
                </div>

                {/* Blackboard */}
                <div className="w-full h-10 rounded-xl bg-gradient-to-r from-green-800 via-green-700 to-green-800 mb-6 flex items-center justify-center shadow-lg border border-green-900/30">
                  <span className="text-white/70 text-xs font-medium tracking-[0.3em] uppercase">Blackboard</span>
                </div>

                {/* 3-Column Bench Grid */}
                <div className="grid grid-cols-3 gap-5">
                  {roomGrid.columns.map((column, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-2.5">
                      <div className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-widest pb-1 border-b border-dashed border-slate-200">
                        Column {colIdx + 1}
                      </div>
                      {column.map((bench, benchIdx) => (
                        <div
                          key={benchIdx}
                          className="flex items-stretch gap-1.5"
                          style={{ animationDelay: `${(colIdx * column.length + benchIdx) * 30}ms`, animation: "rv-fadeInUp 0.35s ease-out forwards", opacity: 0 }}
                        >
                          {/* Row label */}
                          <div className="flex items-center justify-center flex-shrink-0 w-7">
                            <span className="text-[9px] font-bold text-slate-400/70 uppercase tracking-tight">R{benchIdx + 1}</span>
                          </div>

                          {/* Bench */}
                          <div className="flex-1 relative bg-gradient-to-b from-amber-100/90 to-amber-200/60 rounded-xl border border-amber-300/40 shadow-sm overflow-visible">
                            <div className="absolute inset-0 opacity-[0.06] pointer-events-none rounded-xl overflow-hidden">
                              <div className="w-full h-px bg-amber-900 mt-3" />
                              <div className="w-full h-px bg-amber-900 mt-5" />
                            </div>
                            <div className="relative grid grid-cols-3 gap-1.5 p-2">
                              {bench.map((slot) => {
                                if (!slot.occupied) {
                                  return (
                                    <div key={slot.positionId} className="flex flex-col items-center justify-center h-[60px] px-1 rounded-lg border border-dashed border-slate-300/50 bg-white/30">
                                      <div className="w-5 h-5 rounded-full border border-dashed border-slate-300/60 bg-white/40 mb-1" />
                                      <span className="text-[9px] text-slate-300 font-medium">{slot.positionId}</span>
                                    </div>
                                  );
                                }

                                const st = STATUS_STYLES[slot.status!];
                                const sessIdx = sessionSeatData.findIndex((s) => s.sessionId === slot.sessionId);
                                const sessBadge = getSessionBadge(sessIdx);
                                const isActive = activeTooltip?.seatId === slot.seatId && activeTooltip?.sessionId === slot.sessionId;
                                const cached = studentCache.current[`${slot.seatId}_${slot.sessionId}`];

                                return (
                                  <div
                                    key={slot.positionId}
                                    className={`
                                      group/seat relative flex flex-col items-center justify-center h-[60px] px-1 rounded-lg cursor-pointer
                                      bg-gradient-to-b ${st.bg} border ${st.border}
                                      transition-all duration-200 hover:scale-[1.06] hover:shadow-lg ${st.glow}
                                      ${isActive ? `scale-[1.06] shadow-lg ${st.glow} ring-2 ring-offset-1 ${st.ring}` : ""}
                                    `}
                                    onMouseEnter={(e) => handleSeatEnter(slot.seatId!, slot.sessionId!, e)}
                                    onMouseLeave={handleSeatLeave}
                                    onClick={(e) => handleSeatClickEvt(slot.seatId!, slot.sessionId!, e)}
                                  >
                                    <div className="w-5 h-5 rounded-full bg-white/70 border border-slate-200/50 flex items-center justify-center mb-0.5 shadow-sm">
                                      <User className={`h-2.5 w-2.5 ${st.text}`} />
                                    </div>
                                    <span className={`text-[10px] font-bold leading-tight ${st.text}`}>{slot.seatId}</span>
                                    <span className={`text-[7px] font-semibold text-white/90 ${sessBadge} px-1.5 py-px rounded-full mt-0.5 leading-tight`}>
                                      S{slot.sessionId}
                                    </span>
                                    {cached && (
                                      <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 text-[8px] font-bold text-white bg-slate-700/90 px-1.5 py-[1px] rounded-full shadow-md whitespace-nowrap">
                                        {cached}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                              {bench.length < 3 && Array.from({ length: 3 - bench.length }).map((_, i) => (
                                <div key={`pad-${i}`} className="flex items-center justify-center h-[60px] px-1 rounded-lg border border-dashed border-slate-300/50 bg-white/30">
                                  <span className="text-[10px] text-slate-300">—</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats footer */}
              <div className="mt-5 flex items-center justify-center gap-6 text-xs text-slate-500">
                <span>Occupied: <strong className="text-slate-700">{occupiedTotal}</strong></span>
                <span className="text-slate-300">|</span>
                <span>Total: <strong className="text-slate-700">{roomGrid.slots.length}</strong></span>
                <span className="text-slate-300">|</span>
                <span>Benches: <strong className="text-slate-700">{roomGrid.benches.length}</strong></span>
              </div>
            </>
          )}
        </div>

        <style>{`
          @keyframes rv-fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default RoomViewModal;
