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
    <div className="space-y-8">

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Exam Rooms
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage seating capacity and room details
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
        >
          + Add Room
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Rooms</p>
          <h2 className="text-2xl font-bold">{rooms.length}</h2>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Capacity</p>
          <h2 className="text-2xl font-bold">
            {rooms.reduce((acc, r) => acc + r.totalCapacity, 0)}
          </h2>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Average Capacity</p>
          <h2 className="text-2xl font-bold">
            {rooms.length > 0
              ? Math.floor(
                  rooms.reduce((acc, r) => acc + r.totalCapacity, 0) /
                    rooms.length,
                )
              : 0}
          </h2>
        </Card>
      </div>

      {/* TABLE CARD */}
      <Card className="p-6 shadow-sm">

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={toggleSort}
                    className="cursor-pointer select-none"
                  >
                    Room Number
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Benches</TableHead>
                  <TableHead>Seats / Bench</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedRooms.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No exam rooms found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRooms.map((room) => (
                    <TableRow
                      key={room.roomNumber}
                      className="hover:bg-muted/40 transition"
                    >
                      <TableCell className="font-medium">
                        {room.roomNumber}
                      </TableCell>

                      <TableCell>
                        {editingRoomId === room.roomNumber ? (
                          <input
                            value={editedRoom.name || ""}
                            onChange={(e) => handleChange(e, "name")}
                            className="border px-3 py-1 rounded-md w-full"
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
                            className="border px-3 py-1 rounded-md w-24"
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
                            className="border px-3 py-1 rounded-md w-24"
                          />
                        ) : (
                          room.seatsPerBench
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                          {editingRoomId === room.roomNumber
                            ? editedRoom.totalCapacity
                            : room.totalCapacity}
                        </span>
                      </TableCell>

                      <TableCell>
                        {editingRoomId === room.roomNumber ? (
                          <input
                            value={editedRoom.location || ""}
                            onChange={(e) => handleChange(e, "location")}
                            className="border px-3 py-1 rounded-md w-full"
                          />
                        ) : (
                          room.location
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {editingRoomId === room.roomNumber ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleSave}
                              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingRoomId(null)}
                              className="border px-3 py-1 rounded-md text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(room)}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(room.roomNumber)
                              }
                              className="text-sm text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* ADD ROOM MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4">
            <h3 className="text-xl font-semibold">Create New Room</h3>

            <div className="space-y-3">
              <input
                type="number"
                placeholder="Room Number"
                value={newRoom.roomNumber}
                onChange={(e) => handleNewRoomChange(e, "roomNumber")}
                className="w-full border px-4 py-2 rounded-lg"
              />

              <input
                placeholder="Room Name"
                value={newRoom.name}
                onChange={(e) => handleNewRoomChange(e, "name")}
                className="w-full border px-4 py-2 rounded-lg"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Benches"
                  value={newRoom.benchesTotal}
                  onChange={(e) => handleNewRoomChange(e, "benchesTotal")}
                  className="border px-4 py-2 rounded-lg"
                />

                <input
                  type="number"
                  placeholder="Seats / Bench"
                  value={newRoom.seatsPerBench}
                  onChange={(e) => handleNewRoomChange(e, "seatsPerBench")}
                  className="border px-4 py-2 rounded-lg"
                />
              </div>

              <input
                placeholder="Location"
                value={newRoom.location}
                onChange={(e) => handleNewRoomChange(e, "location")}
                className="w-full border px-4 py-2 rounded-lg"
              />

              <div className="bg-muted p-3 rounded-lg text-sm">
                Total Capacity:
                <span className="font-semibold ml-2">
                  {newRoom.totalCapacity}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateRoom}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </DashboardLayout>
);
};

export default ExamRooms;
