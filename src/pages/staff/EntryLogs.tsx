import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Loader2, LogIn, Clock, LogOut, DoorOpen, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface EntryLogRecord {
  id?: number;
  registerNumber: string;
  roomNumber: number;
  entryTime: string;
  exitTime?: string;
  status: 'ACTIVE' | 'EXITED';
  timestamp?: string;
}

const EntryLogs = () => {
  const REGISTER_NUMBER = "99220041287"; // Fixed register number
  const [roomNumber, setRoomNumber] = useState('');
  const [entryLogs, setEntryLogs] = useState<EntryLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchLogs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      toast.error('Please enter a room number');
      return;
    }

    setIsLoading(true);
    try {
      const cleanedRoomNumber = roomNumber.trim().replace(/[^0-9]/g, '');
      const parsedRoomNumber = parseInt(cleanedRoomNumber, 10);
      
      if (isNaN(parsedRoomNumber)) {
        toast.error('Please enter a valid room number');
        setIsLoading(false);
        return;
      }

      // Try to fetch entry logs for this room
      // This would be your actual API endpoint
      const response = await axios.get(
        `http://localhost:8080/api/v1/entry-logs/${parsedRoomNumber}`
      );
      
      if (response.data && Array.isArray(response.data)) {
        setEntryLogs(response.data);
        if (response.data.length === 0) {
          toast.info(`No entry logs found for room ${parsedRoomNumber}`);
        } else {
          toast.success(`Found ${response.data.length} entry log(s)`);
        }
      } else {
        setEntryLogs([]);
        toast.info(`No entry logs found for room ${parsedRoomNumber}`);
      }
    } catch (error: any) {
      // If API is not available, show a demo message
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        toast.info('Entry logs will appear here after validation');
        setEntryLogs([]);
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch entry logs');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Entry Logs</h1>
            <p className="text-sm text-slate-500 mt-1">
              Track room entry and exit records
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Search Entry Logs</h2>
          
          {/* Fixed Register Number Display */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
            <p className="text-xs text-slate-500 font-medium mb-1">Register Number (Fixed)</p>
            <p className="text-lg font-semibold text-slate-800">99220041287</p>
          </div>

          <form onSubmit={handleSearchLogs} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomNumber" className="text-slate-700 font-semibold">Room Number *</Label>
              <Input
                id="roomNumber"
                type="text"
                placeholder="e.g., 102"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isLoading}
                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Logs
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Entry Logs Display */}
        {entryLogs.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <DoorOpen className="h-5 w-5 text-blue-600" />
                Entry Records - Room {roomNumber}
              </h2>
              <p className="text-sm text-slate-500 mt-1">{entryLogs.length} record(s) found</p>
            </div>

            <div className="divide-y divide-slate-100">
              {entryLogs.map((log, index) => (
                <div key={index} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <LogIn className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">Entered</p>
                          <p className="text-xs text-slate-500">Register: {log.registerNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 ml-11">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>{formatTime(log.entryTime || log.timestamp || '')}</span>
                      </div>
                    </div>

                    <div className={`px-3 py-1.5 rounded-lg font-semibold text-xs ${
                      log.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {log.status === 'ACTIVE' ? 'Active' : 'Exited'}
                    </div>
                  </div>

                  {log.exitTime && (
                    <div className="flex items-start gap-4 mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10">
                          <LogOut className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">Exited</p>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span>{formatTime(log.exitTime)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {entryLogs.length === 0 && roomNumber && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <DoorOpen className="h-12 w-12 text-amber-600 mx-auto mb-3 opacity-50" />
            <p className="text-slate-700 font-semibold">No entry logs found</p>
            <p className="text-sm text-slate-500 mt-1">
              Enter a room number to see its entry and exit logs
            </p>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">How It Works</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>When you validate access to a room, an entry log is automatically created</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Enter a room number above to view all entry/exit records for that room</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Each log shows the exact time of entry and exit for security tracking</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>All records are timestamped and audit-ready</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EntryLogs;
