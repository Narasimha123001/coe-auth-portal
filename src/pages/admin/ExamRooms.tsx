import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { roomsApi, ExamRoom } from "@/api/roomsApi";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, MoreVertical } from "lucide-react";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { DataTableSkeleton } from "@/components/data-table/DataTableSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

const ExamRooms = () => {
  const [rooms, setRooms] = useState<ExamRoom[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("roomNumber");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<ExamRoom | null>(null);

  /* ================= FETCH ================= */

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const sort = `${sortKey},${sortOrder}`;
      const data = await roomsApi.getExamRooms(page, size, search, sort);

      setRooms(data?.content ?? []);
      setTotalPages(data?.page?.totalPages ?? 0);
      setTotalElements(data?.page?.totalElements ?? 0);
    } catch {
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [page, search, sortKey, sortOrder]);

  const handleSort = (key: string) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
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

  /* ================= ADD / EDIT ================= */

  const [formData, setFormData] = useState<Partial<ExamRoom>>({});

  const openAddModal = () => {
    setFormData({
      roomNumber: 0,
      name: "",
      benchesTotal: 0,
      seatsPerBench: 0,
      totalCapacity: 0,
      location: "",
    });
    setEditingRoom(null);
    setIsAddOpen(true);
  };

  const openEditModal = (room: ExamRoom) => {
    setFormData(room);
    setEditingRoom(room);
    setIsAddOpen(true);
  };

  const handleChange = (field: keyof ExamRoom, value: any) => {
    const updated = { ...formData, [field]: value };

    if (field === "benchesTotal" || field === "seatsPerBench") {
      const benches = Number(updated.benchesTotal || 0);
      const seats = Number(updated.seatsPerBench || 0);
      updated.totalCapacity = benches * seats;
    }

    setFormData(updated);
  };

  const handleSave = async () => {
    try {
      if (editingRoom) {
        await roomsApi.updateExamRoom(
          editingRoom.roomNumber,
          formData as ExamRoom
        );
        toast.success("Room updated successfully");
      } else {
        await roomsApi.createExamRoom(formData as ExamRoom);
        toast.success("Room created successfully");
      }

      setIsAddOpen(false);
      fetchRooms();
    } catch {
      toast.error("Operation failed");
    }
  };

  /* ================= STATS ================= */

  const totalCapacity = rooms.reduce(
    (acc, r) => acc + r.totalCapacity,
    0
  );

  const averageCapacity =
    rooms.length > 0
      ? Math.floor(totalCapacity / rooms.length)
      : 0;

  /* ================= UI ================= */

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Exam Rooms</h1>
           
          </div>

          <button
            onClick={openAddModal}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            + Add Room
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Rooms</p>
            <h2 className="text-2xl font-bold">{totalElements}</h2>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Capacity</p>
            <h2 className="text-2xl font-bold">{totalCapacity}</h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Average Capacity</p>
            <h2 className="text-2xl font-bold">{averageCapacity}</h2>
          </Card>
        </div>

        {/* TABLE */}
        <Card className="p-6 space-y-6">

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
            />
          </div>

          {loading ? (
            <DataTableSkeleton />
          ) : (
            <>
              <DataTable<ExamRoom>
                columns={[
                  { header: "Room No", accessor: "roomNumber", sortable: true },
                  { header: "Name", accessor: "name", sortable: true },
                  { header: "Benches", accessor: "benchesTotal" },
                  { header: "Seats / Bench", accessor: "seatsPerBench" },
                  { header: "Capacity", accessor: "totalCapacity" },
                  { header: "Location", accessor: "location" },
                ]}
                data={rooms}
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
                renderActions={(row) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical size={18} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditModal(row)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(row.roomNumber)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />

              <DataTablePagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </Card>

        {/* ADD / EDIT MODAL */}
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
              <h2 className="text-xl font-semibold">
                {editingRoom ? "Edit Room" : "Add Room"}
              </h2>

              <Input
                placeholder="Room Number"
                type="number"
                value={formData.roomNumber || ""}
                onChange={(e) =>
                  handleChange("roomNumber", Number(e.target.value))
                }
              />

              <Input
                placeholder="Room Name"
                value={formData.name || ""}
                onChange={(e) =>
                  handleChange("name", e.target.value)
                }
              />

              <Input
                placeholder="Benches"
                type="number"
                value={formData.benchesTotal || ""}
                onChange={(e) =>
                  handleChange("benchesTotal", Number(e.target.value))
                }
              />

              <Input
                placeholder="Seats per Bench"
                type="number"
                value={formData.seatsPerBench || ""}
                onChange={(e) =>
                  handleChange("seatsPerBench", Number(e.target.value))
                }
              />

              <Input
                placeholder="Location"
                value={formData.location || ""}
                onChange={(e) =>
                  handleChange("location", e.target.value)
                }
              />

              <div className="text-sm">
                Total Capacity:{" "}
                <span className="font-semibold">
                  {formData.totalCapacity || 0}
                </span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Save
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