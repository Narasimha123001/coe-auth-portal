import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { roomsApi } from '@/api/roomsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AccessValidation = () => {
  const { user } = useAuth();
  const [roomName, setRoomName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    allowed: boolean;
    message: string;
  } | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    setIsChecking(true);
    setValidationResult(null);
    try {
      const result = await roomsApi.validateAccess(user!.registerNumber, roomName);
      setValidationResult(result);
      if (result.allowed) {
        toast.success('Access granted!');
      } else {
        toast.error('Access denied!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Validation failed');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Access Validation</h1>
          <p className="text-muted-foreground mt-2">
            Check if you have access to a specific room
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Validate Room Access</CardTitle>
            <CardDescription>
              Enter the room name to check your access permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleValidate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  placeholder="e.g., Conference Room A"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  disabled={isChecking}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isChecking}>
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Check Access'
                )}
              </Button>
            </form>

            {validationResult && (
              <div
                className={`mt-6 p-6 rounded-lg border-2 ${
                  validationResult.allowed
                    ? 'bg-success/5 border-success'
                    : 'bg-destructive/5 border-destructive'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {validationResult.allowed ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-success" />
                      <h3 className="text-lg font-semibold text-success">Access Granted</h3>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-destructive" />
                      <h3 className="text-lg font-semibold text-destructive">Access Denied</h3>
                    </>
                  )}
                </div>
                <p className="text-sm">{validationResult.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">About Access Validation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              • This system validates your access permissions in real-time
            </p>
            <p>
              • Room access is controlled by administrators
            </p>
            <p>
              • Contact your administrator if you need access to additional rooms
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccessValidation;
