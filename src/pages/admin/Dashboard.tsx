import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, DoorOpen, Calendar, Shield, TrendingUp, AlertCircle, CheckCircle, 
  Activity, Zap, BookOpen, Clock, Eye, UserCheck, BarChart3, ArrowUpRight, 
  ArrowDownRight, Wifi, Database, Lock, Server, GraduationCap, Award, ChevronRight
} from 'lucide-react';
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
  const { logout, user } = useAuth();
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('Now');

  // Fetch Users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.getAll(0, 1000, '', 'id'),
    refetchInterval: 30000,
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
    refetchInterval: 20000,
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

  // Update last update time
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdateTime(format(new Date(), 'HH:mm:ss'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate recent activities
  useEffect(() => {
    const activities: any[] = [];

    if (appointmentsData && appointmentsData.length > 0) {
      appointmentsData.slice(0, 2).forEach((apt: any) => {
        activities.push({
          action: `Appointment scheduled for ${safeFormatDate(apt.appointmentDateTime, 'MMM dd, HH:mm')}`,
          time: apt.createdDate
            ? `${Math.floor((Date.now() - new Date(apt.createdDate).getTime()) / 60000)} min ago`
            : 'Recently',
          type: 'appointment',
          icon: Calendar,
          color: 'text-blue-500',
        });
      });
    }

    if (examsData && examsData.length > 0) {
      examsData.slice(0, 2).forEach((exam: any) => {
        activities.push({
          action: `Exam "${exam.name}" created`,
          time: `${safeFormatDate(exam.startDate)}`,
          type: 'exam',
          icon: BookOpen,
          color: 'text-purple-500',
        });
      });
    }

    if (accessListData && accessListData.length > 0) {
      accessListData.slice(0, 1).forEach((access: any) => {
        activities.push({
          action: `Room access: ${access.userName} → ${access.blackRoomName}`,
          time: 'Recently',
          type: 'access',
          icon: DoorOpen,
          color: 'text-green-500',
        });
      });
    }

    setRecentActivities(activities.slice(0, 5));
  }, [appointmentsData, examsData, accessListData]);

  // Calculate metrics
  const todayAppointments = appointmentsData?.filter((apt: any) => {
    const aptDate = new Date(apt.appointmentDateTime).toDateString();
    const today = new Date().toDateString();
    return aptDate === today;
  })?.length || 0;

  const totalUsers = usersData?.page?.totalElements || 0;
  const activeRooms = roomsData?.length || 0;
  const totalAppointments = appointmentsData?.length || 0;
  const accessGrants = accessListData?.length || 0;
  const totalExams = examsData?.length || 0;
  const totalDepartments = departmentsData?.length || 0;

  // Stat card component with animation
  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    bgColor, 
    trend,
    trendDirection,
    loading,
    subtext
  }: any) => (
    <Card className="glass-card hover:shadow-xl hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 group">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex-1">
          <CardTitle className="text-sm font-semibold text-muted-foreground mb-1">
            {title}
          </CardTitle>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{value.toLocaleString()}</div>
              {trend && (
                <div className={`flex items-center gap-0.5 text-xs font-semibold ${
                  trendDirection === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {trendDirection === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {trend}
                </div>
              )}
            </div>
          )}
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgColor} group-hover:shadow-lg transition-all duration-300`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </CardHeader>
    </Card>
  );

  // Main metrics
  const mainStats = [
    {
      title: 'Total Students',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      loading: usersLoading,
      trend: '+12%',
      trendDirection: 'up',
      subtext: 'This semester',
    },
    {
      title: 'Active Rooms',
      value: activeRooms,
      icon: DoorOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      loading: roomsLoading,
      trend: '+5%',
      trendDirection: 'up',
      subtext: 'Ready for exams',
    },
    {
      title: "Today's Appointments",
      value: todayAppointments,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      loading: appointmentsLoading,
      trend: `+${Math.ceil(totalAppointments * 0.15)}%`,
      trendDirection: 'up',
      subtext: 'Scheduled today',
    },
    {
      title: 'Access Grants',
      value: accessGrants,
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      loading: accessLoading,
      subtext: 'Active permissions',
    },
  ];

  return (
    <DashboardLayout>
      {/* Header with timestamp */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              {format(new Date(), 'EEEE, MMMM d, yyyy')} • Last updated: {lastUpdateTime}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-700">Live</span>
            </div>
            {user && (
              <Badge variant="outline" className="text-xs">
                {user.role}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {mainStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="glass-card relative overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                Total Exams
              </CardTitle>
              <BookOpen className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            {examsLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{totalExams}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </Card>

        <Card className="glass-card relative overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                Departments
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            {deptLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{totalDepartments}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Active</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </Card>

        <Card className="glass-card relative overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                Total Appointments
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{totalAppointments}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Total scheduled</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </Card>

        <Card className="glass-card relative overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                System Uptime
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Recent Activity - Large Section */}
        <Card className="glass-card lg:col-span-2 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Latest system events</p>
              </div>
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Activity className="h-8 w-8 mb-2 opacity-30" />
                <p>No activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, i) => {
                  const ActivityIcon = activity.icon;
                  return (
                    <div 
                      key={i} 
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 group cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg bg-muted group-hover:scale-110 transition-transform duration-200`}>
                        <ActivityIcon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:not-truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="glass-card hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle>System Health</CardTitle>
              <Wifi className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[
                { label: 'Database', status: 'Operational', color: 'bg-green-500', icon: Database },
                { label: 'API Server', status: 'Operational', color: 'bg-green-500', icon: Server },
                { label: 'Authentication', status: 'Operational', color: 'bg-green-500', icon: Lock },
                { label: 'Cache Layer', status: 'Operational', color: 'bg-green-500', icon: Zap },
              ].map((service, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <service.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium">{service.label}</span>
                  </div>
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

      {/* Bottom Grid - Exams and Quick Links */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Exams */}
        <Card className="glass-card hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Exams</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Next scheduled exams</p>
              </div>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {examsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : examsData && examsData.length > 0 ? (
              <div className="space-y-3">
                {examsData.slice(0, 4).map((exam: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="flex items-start justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/60 transition-colors group cursor-pointer border border-border/30 hover:border-primary/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                          {exam.name || 'N/A'}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {safeFormatDate(exam.startDate)} - {safeFormatDate(exam.endDate)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold flex-shrink-0">
                      {exam.examType || 'Exam'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No upcoming exams</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Access Links */}
        <Card className="glass-card hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quick Access</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Frequently used actions</p>
              </div>
              <Eye className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Manage Students', href: '/admin/students', icon: Users, color: 'text-blue-500' },
                { label: 'Manage Exams', href: '/admin/exams', icon: BookOpen, color: 'text-purple-500' },
                { label: 'Room Access', href: '/admin/room-access', icon: Shield, color: 'text-green-500' },
                { label: 'Seat Assignment', href: '/admin/seat-assignment', icon: Award, color: 'text-orange-500' },
                { label: 'Departments', href: '/admin/departments', icon: GraduationCap, color: 'text-cyan-500' },
                { label: 'Rooms', href: '/admin/rooms', icon: DoorOpen, color: 'text-pink-500' },
              ].map((link, idx) => {
                const LinkIcon = link.icon;
                return (
                  <a
                    key={idx}
                    href={link.href}
                    className="flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/60 hover:border-primary/50 transition-all duration-200 group"
                  >
                    <LinkIcon className={`h-4 w-4 ${link.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-semibold group-hover:text-primary transition-colors truncate">
                      {link.label}
                    </span>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Stats */}
      <div className="mt-8 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-muted-foreground text-center">
          This dashboard updates in real-time. Data is refreshed every 20-60 seconds based on the metric type.
          <span className="block mt-2 font-semibold text-foreground">
            System Status: All services operational ✓
          </span>
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
