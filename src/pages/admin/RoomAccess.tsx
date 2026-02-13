import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { roomsApi, RoomAccessList, Room } from "@/api/roomsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Loader2, DoorOpen } from "lucide-react";
import { toast } from "react-hot-toast";
import { StaffRespone, usersApi } from "@/api/usersApi";

const RoomAccess = () => {
  /*-- staff state--*/
  const [staff, setStaff] = useState<StaffRespone[]>([]);

  /* ---------------- ROOM STATE ---------------- */
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    blackRoomNumber: "",
    blackRoomName: "",
  });

  /* ---------------- ACCESS STATE ---------------- */
  const [accessList, setAccessList] = useState<RoomAccessList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    staffId: "",
    roomName: "",
  });

  useEffect(() => {
    fetchAccessList();
    fetchRooms();
    fetchStaff();
  }, []);

  /* ------------------ staff ------*/

  const fetchStaff = async () => {
    try {
      const data = await usersApi.getAllStaff();
      setStaff(data);
    } catch {
      toast.error("Failed to fetch staff");
    }
  };

  /* ---------------- FETCH ROOMS ---------------- */
  const fetchRooms = async () => {
    try {
      const data = await roomsApi.getRooms();
      setRooms(data);
    } catch {
      toast.error("Failed to fetch rooms");
    }
  };

  /* ---------------- ADD ROOM ---------------- */
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await roomsApi.create({
        blackRoomNumber: Number(roomForm.blackRoomNumber),
        blackRoomName: roomForm.blackRoomName,
      });

      toast.success("Room created successfully");
      setRoomForm({ blackRoomNumber: "", blackRoomName: "" });
      setIsRoomDialogOpen(false);
      fetchRooms();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create room");
    }
  };

  /* ---------------- FETCH ACCESS LIST ---------------- */
  const fetchAccessList = async () => {
    try {
      const data = await roomsApi.getAccessList();
      setAccessList(data);
    } catch {
      toast.error("Failed to fetch access list");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- ASSIGN ACCESS ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roomsApi.assignAccess(formData);
      toast.success("Access granted successfully");
      setIsDialogOpen(false);
      setFormData({ staffId: "", roomName: "" });
      fetchAccessList();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to grant access");
    }
  };

  /* ---------------- REMOVE ACCESS ---------------- */
  const handleRemove = async (staffId: string, roomName: string) => {
    if (!confirm("Are you sure you want to revoke this access?")) return;
    try {
      await roomsApi.removeAccess(staffId, roomName);
      toast.success("Access revoked successfully");
      fetchAccessList();
    } catch {
      toast.error("Failed to revoke access");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ---------------- ROOMS SECTION ---------------- */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Black Rooms</h2>
              <Button
                onClick={() => setIsRoomDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Room
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Room Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground"
                    >
                      No rooms available
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room) => (
                    <TableRow key={room.blackRoomNumber}>
                      <TableCell>{room.blackRoomNumber}</TableCell>
                      <TableCell>{room.blackRoomName}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Staff List</h2>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Reg No</TableHead>
                  <TableHead>Staff Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground"
                    >
                      No staff avaiavble
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((staff) => (
                    <TableRow key={staff.registerNumber}>
                      <TableCell>{staff.registerNumber}</TableCell>
                      <TableCell>{staff.name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
</div>
          {/* ---------------- ACCESS SECTION ---------------- */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Room Access Control</h2>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Grant Access
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessList.map((access, i) => (
                    <TableRow key={i}>
                      <TableCell>{access.staffId}</TableCell>
                      <TableCell>{access.staffName || "-"}</TableCell>
                      <TableCell>{access.roomName}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemove(access.staffId, access.roomName)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      

      {/* ---------------- ADD ROOM DIALOG ---------------- */}
      <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Room</DialogTitle>
            <DialogDescription>Add a new room</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddRoom} className="space-y-4">
            <div>
              <Label>Room Number</Label>
              <Input
                value={roomForm.blackRoomNumber}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, blackRoomNumber: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Room Name</Label>
              <Input
                value={roomForm.blackRoomName}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, blackRoomName: e.target.value })
                }
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRoomDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default RoomAccess;
