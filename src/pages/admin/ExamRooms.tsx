import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { roomsApi, ExamRoom } from "@/api/roomsApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Loader2, MoreVertical, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "react-hot-toast";

const ExamRooms = () => {
  const [rooms, setRooms] = useState<ExamRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editedRoom, setEditedRoom] = useState<Partial<ExamRoom>>({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomsApi.getExamRooms();
      setRooms(data);
    } catch {
      toast.error("Failed to fetch exam rooms");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD ROOM ================= */

  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    name: "",
    benchesTotal: "",
    seatsPerBench: "",
    totalCapacity: 0,
    location: "",
  });

  const handleNewRoomChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof newRoom,
  ) => {
    let value: string | number = e.target.value;

    if (field === "benchesTotal" || field === "seatsPerBench") {
      const numericValue = Number(value);

      const benches =
        field === "benchesTotal" ? numericValue : Number(newRoom.benchesTotal);

      const seats =
        field === "seatsPerBench"
          ? numericValue
          : Number(newRoom.seatsPerBench);

      setNewRoom({
        ...newRoom,
        [field]: value,
        totalCapacity: benches * seats,
      });

      return;
    }

    setNewRoom({ ...newRoom, [field]: value });
  };

  const handleCreateRoom = async () => {
    if (!newRoom.roomNumber || !newRoom.name) {
      toast.error("Room Number and Name are required");
      return;
    }

    const payload = {
      roomNumber: parseInt(newRoom.roomNumber as string),
      name: newRoom.name,
      benchesTotal: parseInt(newRoom.benchesTotal as string) || 0,
      seatsPerBench: parseInt(newRoom.seatsPerBench as string) || 0,
      totalCapacity:
        (parseInt(newRoom.benchesTotal as string) || 0) *
        (parseInt(newRoom.seatsPerBench as string) || 0),
      location: newRoom.location,
    };

    try {
      await roomsApi.createExamRoom(payload);

      toast.success("Room created successfully");
      setIsAddOpen(false);
      fetchRooms();

      setNewRoom({
        roomNumber: "",
        name: "",
        benchesTotal: "",
        seatsPerBench: "",
        totalCapacity: 0,
        location: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create room");
    }
  };

  /* ================= SORT ================= */

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) =>
      sortDirection === "asc"
        ? a.roomNumber - b.roomNumber
        : b.roomNumber - a.roomNumber,
    );
  }, [rooms, sortDirection]);

  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  /* ================= DELETE ================= */

  const handleDelete = async (roomNumber: number) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await roomsApi.deleteExamRoom(roomNumber);
      toast.success("Room deleted successfully");
      fetchRooms();
    } catch {
      toast.error("Failed to delete room");
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = (room: ExamRoom) => {
    setEditingRoomId(room.roomNumber);
    setEditedRoom(room);
    setOpenMenuId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof ExamRoom,
  ) => {
    let value: string | number = e.target.value;

    if (field === "benchesTotal" || field === "seatsPerBench") {
      const numericValue = Number(value);

      const benches =
        field === "benchesTotal" ? numericValue : editedRoom.benchesTotal || 0;

      const seats =
        field === "seatsPerBench"
          ? numericValue
          : editedRoom.seatsPerBench || 0;

      setEditedRoom({
        ...editedRoom,
        [field]: numericValue,
        totalCapacity: benches * seats,
      });

      return;
    }

    setEditedRoom({ ...editedRoom, [field]: value });
  };

  const handleSave = async () => {
    if (!editingRoomId) return;

    try {
      await roomsApi.updateExamRoom(editingRoomId, editedRoom as ExamRoom);
      toast.success("Room updated successfully");
      setEditingRoomId(null);
      fetchRooms();
    } catch {
      toast.error("Failed to update room");
    }
  };

  /* ================= UI ================= */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="p-6">
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-semibold">Exam Rooms Management</h2>

            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-green-600 text-white px-3 py-1.5 text-sm rounded hover:bg-green-700 transition"
            >
              + Add Room
            </button>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={toggleSort}
                  >
                    <div className="flex items-center gap-1">
                      Room ID
                      {sortDirection === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Benches</TableHead>
                  <TableHead>Seats / Bench</TableHead>
                  <TableHead>Total Capacity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedRooms.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      No exam rooms available
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRooms.map((room) => (
                    <TableRow key={room.roomNumber}>
                      <TableCell>{room.roomNumber}</TableCell>

                      <TableCell>
                        {editingRoomId === room.roomNumber ? (
                          <input
                            value={editedRoom.name || ""}
                            onChange={(e) => handleChange(e, "name")}
                            className="border px-2 py-1 rounded"
                          />
                        ) : (
                          room.name
                        )}
                      </TableCell>

                      <TableCell>
                        {editingRoomId === room.roomNumber ? (
                          <input
                            type="number"
                            value={editedRoom.benchesTotal || ""}
                            onChange={(e) => handleChange(e, "benchesTotal")}
                            className="border px-2 py-1 rounded"
                          />
                        ) : (
                          room.benchesTotal
                        )}
                      </TableCell>

                      <TableCell>
                        {editingRoomId === room.roomNumber ? (
                          <input
                            type="number"
                            value={editedRoom.seatsPerBench || ""}
                            onChange={(e) => handleChange(e, "seatsPerBench")}
                            className="border px-2 py-1 rounded"
                          />
                        ) : (
                          room.seatsPerBench
                        )}
                      </TableCell>

                      <TableCell>
                        {editingRoomId === room.roomNumber
                          ? editedRoom.totalCapacity
                          : room.totalCapacity}
                      </TableCell>

                      <TableCell>
                        {editingRoomId === room.roomNumber ? (
                          <input
                            value={editedRoom.location || ""}
                            onChange={(e) => handleChange(e, "location")}
                            className="border px-2 py-1 rounded"
                          />
                        ) : (
                          room.location
                        )}
                      </TableCell>

                      <TableCell className="text-right relative">
                        {editingRoomId === room.roomNumber ? (
                          <button
                            onClick={handleSave}
                            className="bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            Save
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === room.roomNumber
                                    ? null
                                    : room.roomNumber,
                                )
                              }
                            >
                              <MoreVertical size={18} />
                            </button>

                            {openMenuId === room.roomNumber && (
                              <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow-md z-10">
                                <button
                                  onClick={() => handleEdit(room)}
                                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(room.roomNumber)}
                                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* ADD ROOM MODAL */}
          {isAddOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-[400px] space-y-4">
                <h3 className="text-lg font-semibold">Add New Room</h3>

                <input
                  type="number"
                  placeholder="Enter Room Number"
                  value={newRoom.roomNumber}
                  onChange={(e) => handleNewRoomChange(e, "roomNumber")}
                  className="w-full border px-3 py-2 rounded"
                />

                <input
                  placeholder="Enter Room Name"
                  value={newRoom.name}
                  onChange={(e) => handleNewRoomChange(e, "name")}
                  className="w-full border px-3 py-2 rounded"
                />

                <input
                  type="number"
                  placeholder="Enter Total Benches"
                  value={newRoom.benchesTotal}
                  onChange={(e) => handleNewRoomChange(e, "benchesTotal")}
                  className="w-full border px-3 py-2 rounded"
                />

                <input
                  type="number"
                  placeholder="Enter Seats Per Bench"
                  value={newRoom.seatsPerBench}
                  onChange={(e) => handleNewRoomChange(e, "seatsPerBench")}
                  className="w-full border px-3 py-2 rounded"
                />

                <input
                  placeholder="Enter Location"
                  value={newRoom.location}
                  onChange={(e) => handleNewRoomChange(e, "location")}
                  className="w-full border px-3 py-2 rounded"
                />

                <div className="text-sm text-gray-600">
                  Total Capacity: {newRoom.totalCapacity}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreateRoom}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ExamRooms;
