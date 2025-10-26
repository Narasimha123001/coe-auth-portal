import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { roomsApi } from '@/api/roomsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, LogIn } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EntryLogs = () => {
  const { user } = useAuth();
  const [roomName, setRoomName] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const handleLogEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    setIsLogging(true);
    try {
      await roomsApi.logEntry(user!.registerNumber, roomName);
      toast.success('Entry logged successfully!');
      setRoomName('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to log entry');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Entry Logs</h1>
          <p className="text-muted-foreground mt-2">
            Log your room entries for tracking purposes
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Log Room Entry</CardTitle>
            <CardDescription>
              Record your entry into a room you have access to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogEntry} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  placeholder="e.g., Conference Room A"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  disabled={isLogging}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLogging}>
                {isLogging ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging Entry...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Log Entry
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Entry Log Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              • Always log your entry when accessing a room
            </p>
            <p>
              • Ensure you have proper access permissions before entering
            </p>
            <p>
              • Entry logs help maintain security and accountability
            </p>
            <p>
              • All entries are timestamped and recorded for audit purposes
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Quick Tip</h4>
                <p className="text-sm text-muted-foreground">
                  You can validate your access first using the Access Validation page before logging an entry
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EntryLogs;
