import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { roomsApi, RoomAccessList } from '@/api/roomsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Loader2, DoorOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RoomAccess = () => {
  const [accessList, setAccessList] = useState<RoomAccessList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    staffId: '',
    roomName: '',
  });

  useEffect(() => {
    fetchAccessList();
  }, []);

  const fetchAccessList = async () => {
    try {
      const data = await roomsApi.getAccessList();
      setAccessList(data);
    } catch (error) {
      toast.error('Failed to fetch access list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roomsApi.assignAccess(formData);
      toast.success('Access granted successfully');
      setIsDialogOpen(false);
      setFormData({ staffId: '', roomName: '' });
      fetchAccessList();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to grant access');
    }
  };

  const handleRemove = async (staffId: string, roomName: string) => {
    if (!confirm('Are you sure you want to revoke this access?')) return;
    try {
      await roomsApi.removeAccess(staffId, roomName);
      toast.success('Access revoked successfully');
      fetchAccessList();
    } catch (error) {
      toast.error('Failed to revoke access');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Room Access Control</h1>
            <p className="text-muted-foreground mt-1">
              Manage staff access permissions to rooms
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Grant Access
          </Button>
        </div>

        <Card className="glass-card p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Room Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <DoorOpen className="h-12 w-12 text-muted-foreground/50" />
                          <p>No room access permissions configured</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    accessList.map((access, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{access.staffId}</TableCell>
                        <TableCell>{access.staffName || '-'}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-2">
                            <DoorOpen className="h-4 w-4" />
                            {access.roomName}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(access.staffId, access.roomName)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Room Access</DialogTitle>
            <DialogDescription>
              Assign a staff member access to a specific room
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="staffId">Staff Register Number</Label>
                <Input
                  id="staffId"
                  placeholder="e.g., STAFF001"
                  value={formData.staffId}
                  onChange={(e) =>
                    setFormData({ ...formData, staffId: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  placeholder="e.g., Conference Room A"
                  value={formData.roomName}
                  onChange={(e) =>
                    setFormData({ ...formData, roomName: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Grant Access</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default RoomAccess;
