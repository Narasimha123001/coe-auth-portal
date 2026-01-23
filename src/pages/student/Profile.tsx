import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usersApi } from "@/api/usersApi";
import { getStudentDetailsFromToken, normalizeStudentData } from "@/lib/tokenDecoder";
import { Loader2 } from "lucide-react";

interface StudentProfile {
  registerNo: number;
  name: string;
  email: string;
  departmentName: string;
  year: number;
  semester: number;
}

const StudentProfile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from API
        try {
          console.log("Fetching from API: /student/me");
          const data = await usersApi.getStudentProfile();
          console.log("API Response:", data);
          setProfile(data);
          setError(null);
          return;
        } catch (apiErr) {
          console.error("API fetch error:", apiErr);
          // Fallback: Try to get from token if API fails
          const tokenData = getStudentDetailsFromToken();
          if (tokenData) {
            const normalizedData = normalizeStudentData(tokenData);
            setProfile(normalizedData as StudentProfile);
            setError(null);
          } else {
            setError("Failed to load profile. Please try again.");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Profile</h1>
            <p className="text-slate-600 mt-2">View your student information</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/student/dashboard")}>
              Back to Dashboard
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                <p className="text-slate-600">Loading your profile...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-6">
              <p className="text-red-700 font-medium">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Profile Content */}
        {profile && !loading && (
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
                <CardDescription>Your complete profile details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Avatar and Name Section */}
                  <div className="flex items-center gap-6 pb-6 border-b">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-lg font-semibold bg-blue-500 text-white">
                        {getInitials(profile.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                      <p className="text-slate-600">Register No. {profile.registerNo}</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Register Number */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">
                        Register Number
                      </label>
                      <p className="text-lg text-slate-900">{profile.registerNo}</p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">
                        Email Address
                      </label>
                      <p className="text-lg text-slate-900 break-all">{profile.email}</p>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">
                        Department
                      </label>
                      <p className="text-lg text-slate-900">{profile.departmentName}</p>
                    </div>

                    {/* Year */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">
                        Year
                      </label>
                      <p className="text-lg text-slate-900">Year {profile.year}</p>
                    </div>

                    {/* Semester */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">
                        Semester
                      </label>
                      <p className="text-lg text-slate-900">Semester {profile.semester}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/student/appointments")}
                    className="justify-start"
                  >
                    View My Appointments
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/student/book")}
                    className="justify-start"
                  >
                    Book New Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
