import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, User, Calendar, ClipboardList } from "lucide-react";

const StudentDashboard = () => {
  const { studentProfile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!studentProfile) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground py-20">
          No profile found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        
        {/* ===== Welcome Section ===== */}
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {studentProfile.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's a quick overview of your academic information
          </p>
        </div>

        {/* ===== Info Cards ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Register No.
                </p>
                <p className="text-lg font-semibold">
                  {studentProfile.registerNo}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <ClipboardList className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Year & Semester
                </p>
                <p className="text-lg font-semibold">
                  Y{studentProfile.year} S{studentProfile.semester}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Department
                </p>
                <p className="text-lg font-semibold">
                  {studentProfile.departmentName}
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
