import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { appointmentsApi } from '@/api/appointmentsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const BookAppointment = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    appointmentDateTime: '',
    purpose: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.appointmentDateTime || !formData.purpose.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Add seconds because backend expects HH:mm:ss
    const formattedDateTime = formData.appointmentDateTime + ":00";

    const appointmentDate = new Date(formattedDateTime);
    const now = new Date();
    const hoursDiff =
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 12) {
      toast.error('Appointments must be booked at least 12 hours in advance');
      return;
    }

    setIsSubmitting(true);

    try {
      await appointmentsApi.create({
        appointmentDateTime: formattedDateTime,
        purpose: formData.purpose,
      });

      setSuccessMessage(`✓ Appointment booked successfully for ${format(appointmentDate, 'MMM dd, yyyy HH:mm')}`);
      toast.success('Appointment booked successfully!');
      setFormData({ appointmentDateTime: '', purpose: '' });
      setTimeout(() => setSuccessMessage(''), 5000);

    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to book appointment'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 12);
  const minDateString = format(minDate, "yyyy-MM-dd'T'HH:mm");

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-xl blur-lg"></div>
          <div className="relative p-8 rounded-xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Book Appointment
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Schedule a meeting with staff or administration
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-300 ml-2">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>
                  Fill in the details below to book your appointment
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                  <div className="space-y-3">
                    <Label htmlFor="datetime" className="text-base font-semibold text-slate-900 dark:text-white">
                      Date & Time
                    </Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      min={minDateString}
                      value={formData.appointmentDateTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          appointmentDateTime: e.target.value,
                        })
                      }
                      disabled={isSubmitting}
                      required
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      📌 Minimum 12 hours in advance
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="purpose" className="text-base font-semibold text-slate-900 dark:text-white">
                      Purpose of Appointment
                    </Label>
                    <Textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purpose: e.target.value,
                        })
                      }
                      disabled={isSubmitting}
                      rows={5}
                      placeholder="Describe the reason for your appointment..."
                      required
                      className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 resize-none"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Provide clear details about what you need to discuss
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg transition-all transform hover:scale-105"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Book Appointment
                      </>
                    )}
                  </Button>

                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            {/* Requirements */}
            <Card className="glass-card border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-700 dark:text-slate-300">Book at least 12 hours in advance</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-700 dark:text-slate-300">Provide a clear purpose</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-700 dark:text-slate-300">Confirm your appointment details</p>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="glass-card border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
              <CardHeader>
                <CardTitle className="text-base">💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <p>• Be specific about your needs</p>
                <p>• Choose a convenient time slot</p>
                <p>• Check your confirmation email</p>
                <p>• Set a reminder before the appointment</p>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="glass-card border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="/student/appointments" className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors text-sm text-primary hover:text-primary/80">
                  <ArrowRight className="h-4 w-4" />
                  View My Appointments
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookAppointment;
