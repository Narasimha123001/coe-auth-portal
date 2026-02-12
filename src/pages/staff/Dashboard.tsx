

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";

const StaffDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <DashboardLayout>
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        
      </div>
      <p>Welcome, Staff! Here you can validate access, view entry logs, and manage appointments.</p>
      {/* Add staff-specific features/components here */}
    </div>  
    </DashboardLayout>
  );
};

export default StaffDashboard;
