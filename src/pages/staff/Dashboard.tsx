
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { appointmentsApi } from "@/api/appointmentsApi";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, LogIn, Eye, BarChart3, AlertCircle, Check, Clock, User, Zap } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch appointments
  const { data: appointmentsData, isLoading: apptLoading } = useQuery({
    queryKey: ['staff-appointments'],
    queryFn: () => appointmentsApi.getAll(),
    refetchInterval: 20000,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = [
    {
      title: "Today's Tasks",
      value: appointmentsData?.length || 0,
      icon: ClipboardList,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Pending Validations",
      value: appointmentsData?.filter((a: any) => a.status === 'PENDING').length || 0,
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Completed",
      value: appointmentsData?.filter((a: any) => a.status === 'CONFIRMED').length || 0,
      icon: Check,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Issues",
      value: 0,
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  const recentAppointments = appointmentsData?.slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-xl blur-lg"></div>
          <div className="relative p-8 rounded-xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                  Staff Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Welcome back! Manage validations and entry logs
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat) => (
            <Card key={stat.title} className="glass-card hover:shadow-lg transition-all transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    {apptLoading ? (
                      <Skeleton className="h-8 w-12 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start h-11 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  onClick={() => navigate('/staff/access-validation')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Validate Access
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start h-11"
                  onClick={() => navigate('/staff/entry-logs')}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  View Entry Logs
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start h-11"
                  onClick={() => navigate('/staff/appointments')}
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  My Appointments
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start h-11"
                  onClick={() => navigate('/staff/attendance')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Attendance
                </Button>
              </CardContent>
            </Card>

            {/* Staff Info */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Staff ID</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{user?.registerNumber}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-semibold text-slate-900 dark:text-white break-all text-sm">{user?.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <Badge>{user?.role}</Badge>
                </div>
                <Button 
                  variant="destructive"
                  className="w-full mt-4"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Appointments */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Recent Appointments
                  </span>
                  <Badge variant="secondary">{appointmentsData?.length || 0} Total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {apptLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                ) : recentAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {recentAppointments.map((apt: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors border-l-4 border-amber-500">
                        <div className="flex-shrink-0 p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white">{apt.purpose || 'Appointment'}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(apt.appointmentDateTime), 'MMM dd, HH:mm')}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge 
                              variant={apt.status === 'CONFIRMED' ? 'default' : apt.status === 'PENDING' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {apt.status || 'PENDING'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No appointments to display</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Authentication', status: 'Operational', color: 'bg-green-500' },
                { label: 'API Services', status: 'Operational', color: 'bg-green-500' },
                { label: 'Database', status: 'Operational', color: 'bg-green-500' },
                { label: 'System', status: 'Running', color: 'bg-green-500' },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">{service.label}</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${service.color} animate-pulse`} />
                    <span className="text-xs text-muted-foreground">{service.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
