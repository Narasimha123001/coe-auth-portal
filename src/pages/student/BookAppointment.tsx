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

      toast.success('Appointment booked successfully!');
      setFormData({ appointmentDateTime: '', purpose: '' });

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
      <div className="space-y-6 max-w-2xl mx-auto">

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Book Appointment</CardTitle>
            <CardDescription>
              Schedule a meeting
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input
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
                />
              </div>

              <div className="space-y-2">
                <Label>Purpose</Label>
                <Textarea
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purpose: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Booking...' : 'Book Appointment'}
              </Button>

            </form>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default BookAppointment;
