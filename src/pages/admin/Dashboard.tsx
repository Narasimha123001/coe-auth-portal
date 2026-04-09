import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DoorOpen, Calendar, Shield, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/usersApi';
import { roomsApi } from '@/api/roomsApi';
import { appointmentsApi } from '@/api/appointmentsApi';
import { examApi } from '@/api/examApis';
import { departmentsApi } from '@/api/departmentsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format, isToday } from 'date-fns';

// Helper function to safely format dates
const safeFormatDate = (dateString: string | undefined | null, formatStr: string = 'MMM dd, yyyy'): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, formatStr);
  } catch (error) {
    return 'N/A';
  }
};

const Dashboard = () => {
  const { logout } = useAuth();
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Fetch Users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.getAll(0, 1000, '', 'id'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch Rooms
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: () => roomsApi.getRooms(),
    refetchInterval: 30000,
  });

  // Fetch All Appointments
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: () => appointmentsApi.getAll(),
    refetchInterval: 20000, // Refetch every 20 seconds
  });

  // Fetch Room Access List
  const { data: accessListData, isLoading: accessLoading } = useQuery({
    queryKey: ['admin-access-list'],
    queryFn: () => roomsApi.getAccessList(),
    refetchInterval: 30000,
  });

  // Fetch Exams
  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ['admin-exams'],
    queryFn: () => examApi.getAllExams(),
    refetchInterval: 30000,
  });

  // Fetch Departments
  const { data: departmentsData, isLoading: deptLoading } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => departmentsApi.getDepartments(),
    refetchInterval: 60000,
  });

  // Generate recent activities from real data
  useEffect(() => {
    const activities: any[] = [];

    // Add appointment activities
    if (appointmentsData && appointmentsData.length > 0) {
      appointmentsData.slice(0, 3).forEach((apt: any) => {
        activities.push({
          action: `Appointment scheduled for ${safeFormatDate(apt.appointmentDateTime, 'MMM dd, HH:mm')}`,
          time: apt.createdDate
            ? `${Math.floor((Date.now() - new Date(apt.createdDate).getTime()) / 60000)} min ago`
            : 'Recently',
          type: 'appointment',
          icon: Calendar,
        });
      });
    }

    // Add exam activities
    if (examsData && examsData.length > 0) {
      examsData.slice(0, 2).forEach((exam: any) => {
        activities.push({
          action: `Exam "${exam.name}" scheduled`,
          time: `${safeFormatDate(exam.startDate)}`,
          type: 'exam',
          icon: TrendingUp,
        });
      });
    }

    // Add room access activities
    if (accessListData && accessListData.length > 0) {
      accessListData.slice(0, 2).forEach((access: any) => {
        activities.push({
          action: `${access.userName} granted access to ${access.blackRoomName}`,
          time: 'Recently',
          type: 'access',
          icon: Shield,
        });
      });
    }

    setRecentActivities(activities.slice(0, 5)); // Keep top 5 activities
  }, [appointmentsData, examsData, accessListData]);

  // Calculate today's appointments
  const todayAppointments = appointmentsData?.filter((apt: any) => {
    const aptDate = new Date(apt.appointmentDateTime).toDateString();
    const today = new Date().toDateString();
    return aptDate === today;
  })?.length || 0;

  // Stats with real data
  const stats = [
    {
      title: 'Total Students',
      value: usersData?.page?.totalElements || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      loading: usersLoading,
    },
    {
      title: 'Active Rooms',
      value: roomsData?.length || 0,
      icon: DoorOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      loading: roomsLoading,
    },
    {
      title: "Today's Appointments",
      value: todayAppointments,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      loading: appointmentsLoading,
    },
    {
      title: 'Access Grants',
      value: accessListData?.length || 0,
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      loading: accessLoading,
    },
  ];

  const StatCard = ({ stat }: { stat: any }) => (
    <Card className="glass-card hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
          <stat.icon className={`h-4 w-4 ${stat.color}`} />
        </div>
      </CardHeader>
      <CardContent>
        {stat.loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-3xl font-bold">{stat.value}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Real-time system overview and analytics.
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </div>

        {/* Main Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  No activity yet
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 pb-3 border-b last:border-0">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Database', status: 'Operational', color: 'bg-green-500' },
                  { label: 'API Services', status: 'Operational', color: 'bg-green-500' },
                  { label: 'Authentication', status: 'Operational', color: 'bg-green-500' },
                  { label: 'Cache Server', status: 'Operational', color: 'bg-green-500' },
                ].map((service, i) => (
                  <div key={i} className="flex items-center justify-between">
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

          {/* Top Statistics */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Exams</span>
                  {examsLoading ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    <span className="font-bold text-lg">{examsData?.length || 0}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Departments</span>
                  {deptLoading ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    <span className="font-bold text-lg">{departmentsData?.length || 0}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Appointments</span>
                  {appointmentsLoading ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    <span className="font-bold text-lg">{appointmentsData?.length || 0}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Exams */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
            </CardHeader>
            <CardContent>
              {examsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : examsData && examsData.length > 0 ? (
                <div className="space-y-3">
                  {examsData.slice(0, 3).map((exam: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{exam.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">
                          {safeFormatDate(exam.startDate)} - {safeFormatDate(exam.endDate)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {exam.examType || 'N/A'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 text-muted-foreground">
                  No upcoming exams
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: 'Manage Users', href: '/admin/students' },
                  { label: 'Manage Exams', href: '/admin/exams' },
                  { label: 'Room Access', href: '/admin/room-access' },
                  { label: 'Seat Assignment', href: '/admin/seat-assignment' },
                ].map((link, idx) => (
                  <a
                    key={idx}
                    href={link.href}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors text-sm text-primary hover:text-primary/80"
                  >
                    <span>{link.label}</span>
                    <span className="text-xs">→</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
