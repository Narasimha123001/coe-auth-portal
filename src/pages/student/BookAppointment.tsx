import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { appointmentsApi } from '@/api/appointmentsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const BookAppointment = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    purpose: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.appointmentDate || !formData.purpose.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate 12-hour rule
    const appointmentDate = new Date(formData.appointmentDate);
    const now = new Date();
    const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 12) {
      toast.error('Appointments must be booked at least 12 hours in advance');
      return;
    }

    setIsSubmitting(true);
    try {
      await appointmentsApi.create(user!.registerNumber, {
        appointmentDate: formData.appointmentDate,
        purpose: formData.purpose,
      });
      toast.success('Appointment booked successfully!');
      setFormData({ appointmentDate: '', purpose: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 12);
  const minDateString = format(minDate, "yyyy-MM-dd'T'HH:mm");

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Book Appointment</h1>
          <p className="text-muted-foreground mt-2">
            Schedule a meeting with faculty or staff
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>New Appointment</CardTitle>
            <CardDescription>
              Fill in the details below to book your appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Date & Time</Label>
                <Input
                  id="appointmentDate"
                  type="datetime-local"
                  min={minDateString}
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, appointmentDate: e.target.value })
                  }
                  disabled={isSubmitting}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Appointments must be booked at least 12 hours in advance
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe the purpose of your appointment..."
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  disabled={isSubmitting}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
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

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              • Appointments require at least 12 hours advance notice
            </p>
            <p>
              • Please be specific about the purpose of your meeting
            </p>
            <p>
              • You will receive confirmation once your appointment is approved
            </p>
            <p>
              • View your scheduled appointments in the "My Appointments" section
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BookAppointment;
