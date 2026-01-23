

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
            {profile && (
              <p className="text-sm text-slate-600 mt-1">Welcome back, {profile.name}!</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {!loading && profile && (
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10"
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
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r p-6 min-h-[calc(100vh-80px)]">
          {/* Quick Info */}
          {profile && !loading && (
            <div className="mb-8 space-y-4">
              <div className="pb-4 border-b">
                <p className="text-xs text-slate-600 uppercase font-semibold tracking-wide mb-3">
                  Quick Info
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Register No.</p>
                    <p className="font-semibold text-slate-900">{profile.registerNo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Year & Semester</p>
                    <p className="font-semibold text-slate-900">
                      Y{profile.year} S{profile.semester}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Department</p>
                    <p className="font-semibold text-slate-900 text-sm">{profile.departmentName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <div className="space-y-3">
            <p className="text-xs text-slate-600 uppercase font-semibold tracking-wide mb-4">
              Menu
            </p>
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
              onClick={() => navigate("/student/book")}
            >
              <Calendar className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium text-sm">Book Appointment</p>
                <p className="text-xs text-slate-500">Schedule new</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
              onClick={() => navigate("/student/appointments")}
            >
              <ClipboardList className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium text-sm">My Appointments</p>
                <p className="text-xs text-slate-500">View scheduled</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
              onClick={() => navigate("/student/profile")}
            >
              <User className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium text-sm">My Profile</p>
                <p className="text-xs text-slate-500">View information</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-8">
          {/* Quick Info Cards */}
          {profile && !loading && (
            <Card className="mb-8 bg-white shadow-sm">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Register No.</p>
                      <p className="font-semibold text-slate-900">{profile.registerNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <ClipboardList className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Year & Semester</p>
                      <p className="font-semibold text-slate-900">
                        Y{profile.year} S{profile.semester}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
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


        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
