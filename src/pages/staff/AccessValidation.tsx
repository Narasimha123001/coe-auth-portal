import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2, Shield, DoorOpen, Key, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface AccessResult {
  success: boolean;
  message: string;
  roomNumber?: number;
  sessionId?: number;
  access?: boolean;
  details?: any;
}

const AccessValidation = () => {
  const REGISTER_NUMBER = "99220041287"; // Fixed register number
  const [roomNumber, setRoomNumber] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [validationResult, setValidationResult] = useState<AccessResult | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      toast.error('Please enter a room number');
      return;
    }

    setIsChecking(true);
    setValidationResult(null);
    try {
      // Clean room number: remove dots, spaces, and parse as integer
      const cleanedRoomNumber = roomNumber.trim().replace(/[^0-9]/g, '');
      const parsedRoomNumber = parseInt(cleanedRoomNumber, 10);
      
      if (isNaN(parsedRoomNumber) || parsedRoomNumber <= 0) {
        toast.error('Room number must be a valid positive number');
        setIsChecking(false);
        return;
      }

      const endpoint = `http://localhost:8080/api/v1/blackRoom/access/${REGISTER_NUMBER}/checking/${parsedRoomNumber}`;

      const response = await axios.get(endpoint);
      setValidationResult(response.data);
      
      if (response.data.success || response.data.access) {
        toast.success('Access validated successfully!');
        
        // Automatically create entry log when validation is successful
        try {
          await axios.post(
            `http://localhost:8080/api/v1/entry-logs`,
            {
              registerNumber: REGISTER_NUMBER,
              roomNumber: parsedRoomNumber,
              entryTime: new Date().toISOString(),
              status: 'ACTIVE'
            }
          );
          toast.success('Entry log created automatically');
        } catch (logError) {
          // Entry log creation failed but validation was successful, continue
          console.log('Entry log creation attempted');
        }
      } else {
        toast.error('Access validation failed');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Validation failed';
      toast.error(errorMsg);
      setValidationResult({
        success: false,
        message: errorMsg,
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Room Access Validation</h1>
            <p className="text-sm text-slate-500 mt-1">
              Register No: <span className="font-semibold text-slate-700">{REGISTER_NUMBER}</span>
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Input Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-6">Access Validation</h2>
              
              {/* Fixed Register Number Display */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                <p className="text-xs text-slate-500 font-medium mb-1">Register Number (Fixed)</p>
                <p className="text-lg font-semibold text-slate-800">99220041287</p>
              </div>

              <form onSubmit={handleValidate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber" className="text-slate-700 font-semibold">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    type="text"
                    placeholder="e.g., 102"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    disabled={isChecking}
                    className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5"
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating Access...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Check Access
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Right: Info Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <DoorOpen className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-slate-800">How It Works</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Your register number is automatically set to 99220041287</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Enter the room number you want to check access for</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Click "Check Access" to validate</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Get instant access validation result</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Results */}
        {validationResult && (
          <div className={`rounded-2xl border-2 p-6 transition-all ${
            validationResult.success || validationResult.access
              ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300'
              : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                validationResult.success || validationResult.access
                  ? 'bg-emerald-500/20'
                  : 'bg-red-500/20'
              }`}>
                {validationResult.success || validationResult.access ? (
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${
                  validationResult.success || validationResult.access
                    ? 'text-emerald-700'
                    : 'text-red-700'
                }`}>
                  {validationResult.success || validationResult.access ? 'Access Granted' : 'Access Denied'}
                </h3>
                <p className="text-sm text-slate-700 mb-4">{validationResult.message}</p>
                
                {/* Result Details */}
                {(validationResult.roomNumber || validationResult.sessionId) && (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200/50">
                    {validationResult.roomNumber !== undefined && (
                      <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Room Number</p>
                          <p className="text-sm font-semibold text-slate-700">{validationResult.roomNumber}</p>
                        </div>
                      </div>
                    )}
                    {validationResult.sessionId !== undefined && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Session ID</p>
                          <p className="text-sm font-semibold text-slate-700">{validationResult.sessionId}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Details */}
                {validationResult.details && (
                  <div className="mt-4 p-3 bg-white/60 rounded-lg text-xs text-slate-700 font-mono overflow-auto max-h-32">
                    <pre>{JSON.stringify(validationResult.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AccessValidation;
