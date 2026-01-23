

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usersApi } from "@/api/usersApi";
import { getStudentDetailsFromToken, normalizeStudentData } from "@/lib/tokenDecoder";
import { Loader2, User, Calendar, ClipboardList } from "lucide-react";

interface StudentProfile {
  registerNo: number;
  name: string;
  email: string;
  departmentName: string;
  year: number;
  semester: number;
}

const StudentDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Fetching student profile from API...");
        const data = await usersApi.getStudentProfile();
        console.log("Profile loaded from API:", data);
        setProfile(data);
      } catch (err) {
        console.error("API failed, trying token data:", err);
        // Fallback to token data if API fails
        const tokenData = getStudentDetailsFromToken();
        if (tokenData) {
          const normalizedData = normalizeStudentData(tokenData);
          setProfile(normalizedData as StudentProfile);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Profile Avatar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Student Dashboard</h1>
            {profile && (
              <p className="text-slate-600 mt-2">Welcome back, {profile.name}!</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {!loading && profile && (
              <Button
                variant="ghost"
                size="icon"
                className="relative h-12 w-12"
                onClick={() => navigate("/student/profile")}
                title="View Profile"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-500 text-white font-semibold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            )}
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Info Card */}
        {profile && !loading && (
          <Card className="mb-8 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Register No.</p>
                    <p className="font-semibold text-slate-900">{profile.registerNo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Year & Semester</p>
                    <p className="font-semibold text-slate-900">
                      Y{profile.year} S{profile.semester}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:col-span-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Department</p>
                    <p className="font-semibold text-slate-900">{profile.departmentName}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Book Appointment Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/student/book")}>
            <CardHeader>
              <CardTitle className="text-lg">Book Appointment</CardTitle>
              <CardDescription>Schedule a new appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Book an appointment with staff members for consultation or meetings.
              </p>
              <Button className="mt-4 w-full">Book Now</Button>
            </CardContent>
          </Card>

          {/* View Appointments Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/student/appointments")}>
            <CardHeader>
              <CardTitle className="text-lg">My Appointments</CardTitle>
              <CardDescription>View your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Check all your upcoming and past appointments.
              </p>
              <Button className="mt-4 w-full">View Appointments</Button>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/student/profile")}>
            <CardHeader>
              <CardTitle className="text-lg">My Profile</CardTitle>
              <CardDescription>View your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Access your personal and academic information.
              </p>
              <Button className="mt-4 w-full">View Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
