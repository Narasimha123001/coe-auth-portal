import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { appointmentsApi, Appointment } from '@/api/appointmentsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Loader2, RefreshCw, MapPin, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { format, isPast } from 'date-fns';

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
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'pending':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  // Separate upcoming and past appointments
  const now = new Date();
  const upcoming = appointments.filter(apt => !isPast(new Date(apt.appointmentDateTime)));
  const past = appointments.filter(apt => isPast(new Date(apt.appointmentDateTime)));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-xl blur-lg"></div>
          <div className="relative p-8 rounded-xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    My Appointments
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Track all your scheduled meetings
                  </p>
                </div>
              </div>
              <Button
                onClick={fetchAppointments}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="h-10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading your appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <Card className="glass-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Appointments Yet</h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                You haven't booked any appointments. Schedule your first meeting with staff or administration.
              </p>
              <Button 
                onClick={() => window.location.href = '/student/book'}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Your First Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            {upcoming.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upcoming</h2>
                  <Badge variant="default" className="bg-blue-500">{upcoming.length}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((appointment) => (
                    <Card 
                      key={appointment.id} 
                      className="glass-card hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-blue-500"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            {getStatusIcon(appointment.status)}
                            <div>
                              <CardTitle className="text-base">Appointment</CardTitle>
                              <p className="text-xs text-muted-foreground mt-1">ID: {appointment.id}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="secondary"
                            className={`${appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}
                          >
                            {appointment.status?.toLowerCase() || 'pending'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Date & Time */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>Date</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white ml-6">
                            {appointment.appointmentDateTime
                              ? format(new Date(appointment.appointmentDateTime), 'MMM dd, yyyy')
                              : 'Date not set'}
                          </p>
                        </div>

                        {/* Time */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>Time</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white ml-6">
                            {appointment.appointmentDateTime
                              ? format(new Date(appointment.appointmentDateTime), 'HH:mm')
                              : 'Time not set'}
                          </p>
                        </div>

                        {/* Purpose */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <span>Purpose</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 ml-6 line-clamp-2">
                            {appointment.purpose || 'No purpose specified'}
                          </p>
                        </div>

                        {/* Booked Date */}
                        {appointment.createdDate && (
                          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-muted-foreground">
                            Booked on {format(new Date(appointment.createdDate), 'PP')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {past.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Past</h2>
                  <Badge variant="secondary">{past.length}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {past.map((appointment) => (
                    <Card 
                      key={appointment.id} 
                      className="glass-card opacity-75 hover:opacity-100 transition-opacity border-l-4 border-l-slate-400"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <CheckCircle2 className="h-5 w-5 text-slate-400" />
                            <div>
                              <CardTitle className="text-base">Appointment</CardTitle>
                              <p className="text-xs text-muted-foreground mt-1">ID: {appointment.id}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                            Completed
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">
                            {appointment.appointmentDateTime
                              ? format(new Date(appointment.appointmentDateTime), 'MMM dd, yyyy HH:mm')
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Purpose:</span>
                          <span className="font-medium line-clamp-2">{appointment.purpose || 'N/A'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Footer */}
        {appointments.length > 0 && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{appointments.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{upcoming.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{past.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAppointments;