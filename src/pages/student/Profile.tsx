import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

const StudentProfile = () => {
  const { studentProfile: profile, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-muted-foreground">
          Profile not available.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        {/* <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Button variant="outline" onClick={() => navigate("/student/dashboard")}>
            Back
          </Button>
        </div> */}

        {/* Profile Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-white text-lg">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="text-xl font-semibold">{profile.name}</p>
                <p className="text-sm text-muted-foreground">
                  Register No. {profile.registerNo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Info label="Email" value={profile.email} />
              <Info label="Department" value={profile.departmentName} />
              <Info label="Year" value={`Year ${profile.year}`} />
              <Info label = "PhoneNo" value={profile.phoneNo}/>
              <Info label="Semester" value={`Semester ${profile.semester}`} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

export default StudentProfile;
