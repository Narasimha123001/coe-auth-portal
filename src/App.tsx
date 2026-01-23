import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import RoomAccess from "./pages/admin/RoomAccess";

// Staff pages
import StaffAppointments from "./pages/staff/MyAppointments";
import AccessValidation from "./pages/staff/AccessValidation";
import EntryLogs from "./pages/staff/EntryLogs";

// Student pages
import BookAppointment from "./pages/student/BookAppointment";
import StudentAppointments from "./pages/student/StudentAppointments";
import  StudentProfile from "./pages/student/Profile";

// Dashboard pages
import StudentDashboard from "./pages/student/Dashboard";
import StaffDashboard from "./pages/staff/Dashboard";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const dashboardMap: Record<string, string> = {
    admin: '/admin/dashboard',
    staff: '/staff/appointments',
    student: '/student/dashboard',
  };
  return <Navigate to={dashboardMap[user.role] || '/login'} replace />;

  return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RoomAccess />
                </ProtectedRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff/appointments"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/validation"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <AccessValidation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/logs"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <EntryLogs />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
                        <Route
                          path="/student/dashboard"
                          element={
                            <ProtectedRoute allowedRoles={["student"]}>
                              <StudentDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/staff/dashboard"
                          element={
                            <ProtectedRoute allowedRoles={["staff"]}>
                              <StaffDashboard />
                            </ProtectedRoute>
                          }
                        />
            <Route
              path="/student/book"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <BookAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/appointments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
