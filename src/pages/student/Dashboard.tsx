import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Calendar, ClipboardList, Mail, Phone, MapPin, Award, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/usersApi";
import { appointmentsApi } from "@/api/appointmentsApi";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const StudentDashboard = () => {
  const { studentProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ appointments: 0, subjects: 0 });

  // Fetch student appointments
  const { data: appointmentsData, isLoading: apptLoading } = useQuery({
    queryKey: ['student-appointments'],
    queryFn: () => appointmentsApi.getByUser(''),
    refetchInterval: 30000,
  });

  // Fetch student subjects
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['student-subjects'],
    queryFn: () => usersApi.getStudentSubjects(),
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (appointmentsData && subjectsData) {
      setStats({
        appointments: appointmentsData.length || 0,
        subjects: subjectsData.subjects?.length || 0,
      });
    }
  }, [appointmentsData, subjectsData]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!studentProfile) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground py-20">
          <p className="text-lg">No profile information available</p>
        </div>
      </DashboardLayout>
    );
  }

  const upcomingAppointments = appointmentsData?.slice(0, 3) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-lg"></div>
          <div className="relative p-8 rounded-xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                  Welcome back, {studentProfile.name}!
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Here's your academic dashboard and upcoming activities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="glass-card hover:shadow-lg transition-all transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Register Number</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {studentProfile.registerNo}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-all transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Year & Semester</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    Y{studentProfile.year} S{studentProfile.semester}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-all transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {studentProfile.departmentName.substring(0, 15)}...
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-all transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Appointments</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {stats.appointments}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium truncate">{studentProfile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{studentProfile.phoneNo || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" onClick={() => navigate('/student/profile')}>
                  View Full Profile
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start h-10" onClick={() => navigate('/student/book')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
                <Button variant="outline" className="w-full justify-start h-10" onClick={() => navigate('/student/appointments')}>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  My Appointments
                </Button>
                <Button variant="outline" className="w-full justify-start h-10" onClick={() => navigate('/student/subjects')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Subjects
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
                <Badge variant="secondary">{stats.appointments} Total</Badge>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((apt: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors border-l-4 border-blue-500">
                        <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white">{apt.purpose || 'Appointment'}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(apt.appointmentDateTime), 'MMM dd, yyyy HH:mm')}
                          </p>
                          <Badge className="mt-2" variant={apt.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                            {apt.status || 'PENDING'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No appointments yet</p>
                    <Button variant="link" size="sm" className="mt-2" onClick={() => navigate('/student/book')}>
                      Book one now →
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enrolled Subjects */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Enrolled Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjectsLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : subjectsData?.subjects && subjectsData.subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectsData.subjects.map((subject: any, idx: number) => (
                  <div key={idx} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow">
                    <p className="text-sm text-muted-foreground font-mono">{subject.subjectCode}</p>
                    <p className="text-slate-900 dark:text-white font-semibold mt-1">{subject.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No subjects enrolled yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
