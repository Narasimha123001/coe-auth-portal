import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { appointmentsApi, Appointment } from "@/api/appointmentsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await appointmentsApi.getAll();

      const sorted = data.sort(
        (a, b) =>
          new Date(b.appointmentDateTime).getTime() -
          new Date(a.appointmentDateTime).getTime()
      );

      setAppointments(sorted);
    } catch (error) {
      toast.error("Failed to fetch appointments");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">All Student Appointments</h1>

          <Button
            onClick={fetchAppointments}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <CardTitle>
                    #{appointment.id} - Reg No:{" "}
                    {appointment.registrationNumber}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2 text-sm">
                  <div>
                    <strong>Date:</strong>{" "}
                    {format(
                      new Date(appointment.appointmentDateTime),
                      "PPP"
                    )}
                  </div>

                  <div>
                    <strong>Time:</strong>{" "}
                    {format(
                      new Date(appointment.appointmentDateTime),
                      "p"
                    )}
                  </div>

                  <div>
                    <strong>Purpose:</strong> {appointment.purpose}
                  </div>

                  <div>
                    <strong>Status:</strong> {appointment.status}
                  </div>

                  {appointment.createdDate && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Booked on{" "}
                      {format(new Date(appointment.createdDate), "PP")}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAppointments;
