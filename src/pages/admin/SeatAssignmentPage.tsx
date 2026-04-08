import React, { useState } from "react";
import { seatApi } from "@/api/seatsApi";

interface Props {
  date: string;
  slotCode: string;
  sessionId: number; // still needed for seat & student
}

const SeatPage = ({ date, slotCode, sessionId }: Props) => {
  const [rooms, setRooms] = useState<number[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [seats, setSeats] = useState<number[]>([]);
  const [studentsMap, setStudentsMap] = useState<Record<number, number>>({});
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);

  /* ---------------- LOAD ROOMS ---------------- */
  const handleView = async () => {
    try {
      setLoadingRooms(true);

      const res = await seatApi.getRoomsByDateAndSlot(date, slotCode);

      setRooms(res.data.rooms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRooms(false);
    }
  };

  /* ---------------- ROOM CLICK ---------------- */
  const handleRoomClick = async (roomId: number) => {
    try {
      setSelectedRoom(roomId);
      setLoadingSeats(true);

      const res = await seatApi.getSeatsByRoom(roomId, sessionId);

      setSeats(res.data);
      setStudentsMap({});
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSeats(false);
    }
  };

  /* ---------------- SEAT CLICK ---------------- */
  const handleSeatClick = async (seatId: number) => {
    try {
      const res = await seatApi.getStudentBySeat(seatId, sessionId);

      setStudentsMap((prev) => ({
        ...prev,
        [seatId]: res.data,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 border rounded-lg mt-4">

      {/* ✅ VIEW BUTTON */}
      <button
        onClick={handleView}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {loadingRooms ? "Loading Rooms..." : "View Rooms"}
      </button>

      {/* 🏫 ROOMS */}
      {rooms.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Rooms</h2>

          <div className="grid grid-cols-6 gap-4">
            {rooms.map((room) => (
              <div
                key={room}
                onClick={() => handleRoomClick(room)}
                className={`p-4 rounded-lg cursor-pointer text-center shadow
                  ${
                    selectedRoom === room
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-blue-100"
                  }
                `}
              >
                Room {room}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🪑 SEATS */}
      {selectedRoom && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Room {selectedRoom} Seats
          </h2>

          {loadingSeats ? (
            <p>Loading seats...</p>
          ) : (
            <div className="grid grid-cols-10 gap-2">
              {seats.map((seatId) => (
                <div
                  key={seatId}
                  onClick={() => handleSeatClick(seatId)}
                  className="p-3 rounded text-xs text-center font-medium cursor-pointer
                             bg-green-200 hover:bg-green-300"
                >
                  <div>Seat {seatId}</div>

                  {/* 🎯 Student ID */}
                  {studentsMap[seatId] && (
                    <div className="text-red-600 font-bold">
                      {studentsMap[seatId]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeatPage;