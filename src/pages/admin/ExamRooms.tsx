import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { roomsApi , ExamRoom } from "@/api/roomsApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const ExamRooms = () => {
  const [rooms, setRooms] = useState<ExamRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomsApi.getExamRooms();
      setRooms(data);
    } catch (error) {
      toast.error("Failed to fetch exam rooms");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Exam Rooms Management
          </h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Benches</TableHead>
                  <TableHead>Seats / Bench</TableHead>
                  <TableHead>Total Capacity</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rooms.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No exam rooms available
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room) => (
                    <TableRow key={room.roomNumber}>
                      <TableCell>{room.roomNumber}</TableCell>
                      <TableCell>{room.name}</TableCell>
                      <TableCell>{room.benchesTotal}</TableCell>
                      <TableCell>{room.seatsPerBench}</TableCell>
                      <TableCell>{room.totalCapacity}</TableCell>
                      <TableCell>{room.location}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ExamRooms;