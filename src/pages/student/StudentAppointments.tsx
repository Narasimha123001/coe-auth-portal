import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { appointmentsApi, Appointment } from '@/api/appointmentsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, FileText, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const StudentAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await appointmentsApi.getByUser(user!.registerNumber);
      
      console.log('Fetched appointments:', data);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        // Sort by date, most recent first
        const sorted = data.sort((a, b) => 
          new Date(b.appointmentDateTime).getTime() - new Date(a.appointmentDateTime).getTime()
        );
        setAppointments(sorted);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to fetch appointments');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return '✓';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '✕';
      default:
        return '○';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Appointments</h1>
            <p className="text-muted-foreground mt-1">
              Track all your scheduled appointments
            </p>
          </div>
          <Button
            onClick={fetchAppointments}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Book your first appointment to get started
              </p>
              <Button onClick={() => window.location.href = '/student/BookAppintment'}>
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Showing {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {appointments.map((appointment) => (
                <Card 
                  key={appointment.id} 
                  className="glass-card hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Appointment #{appointment.id}
                      </CardTitle>
                      {appointment.status && (
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusIcon(appointment.status)} {appointment.status.toLowerCase()}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Appointment Date & Time */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>Appointment Time</span>
                      </div>
                      <div className="ml-6 text-sm text-gray-600">
                        {appointment.appointmentDateTime
                          ? format(new Date(appointment.appointmentDateTime), 'PPP')
                          : 'Date not set'}
                      </div>
                      <div className="ml-6 text-sm font-semibold text-gray-900">
                        {appointment.appointmentDateTime
                          ? format(new Date(appointment.appointmentDateTime), 'p')
                          : 'Time not set'}
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>Purpose</span>
                      </div>
                      <div className="ml-6 text-sm text-gray-600">
                        {appointment.purpose || 'No purpose specified'}
                      </div>
                    </div>

                    {/* Created Date */}
                    {appointment.createdDate && (
                      <div className="pt-3 border-t text-xs text-muted-foreground">
                        Booked on {format(new Date(appointment.createdDate), 'PP')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAppointments;