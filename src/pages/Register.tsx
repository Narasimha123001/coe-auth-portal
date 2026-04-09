import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [username, setUsername] = useState('');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const role = 'STUDENT'; // Fixed role
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      const dashboardMap: Record<string, string> = {
        admin: '/admin/dashboard',
        staff: '/staff/appointments',
        student: '/student/book',
      };
      navigate(dashboardMap[user.role] || '/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!username || !gmail || !password || !confirmPassword || !registerNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@(gmail\.com|klu\.ac\.in)$/;
    if (!emailRegex.test(gmail)) {
      toast.error('Please enter a valid Gmail or KLU university email address');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (isNaN(Number(registerNumber))) {
      toast.error('Register Number must be a valid number');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.register({ 
        username,
        email: gmail,
        password, 
        registerNumber: Number(registerNumber),
        role
      });
      
      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10 translate-x-1/2 translate-y-1/2 animate-pulse"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Header Section */}
        <Link to="/login" className="inline-flex items-center text-slate-300 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 transform hover:scale-110 transition-transform">
            <Shield className="h-11 w-11 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">
            Join COE
          </h1>
          <p className="text-slate-300 text-sm">Create your account to get started</p>
        </div>

        {/* Registration Card */}
        <Card className="glass-card border border-slate-700/50 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-slate-100">Create Account</CardTitle>
            <CardDescription className="text-slate-300">
              Complete all fields to sign up
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="username" className="text-slate-200 font-medium">Full Name</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="John Doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="registerNumber" className="text-slate-200 font-medium">Register Number</Label>
                  <Input
                    id="registerNumber"
                    type="number"
                    placeholder="1234567890"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    disabled={isLoading}
                    className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="gmail" className="text-slate-200 font-medium">Email Address</Label>
                  <Input
                    id="gmail"
                    type="email"
                    placeholder="you@gmail.com or you@klu.ac.in"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    disabled={isLoading}
                    className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="password" className="text-slate-200 font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30"
                  />
                  <p className="text-xs text-slate-400">Minimum 8 characters required</p>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="confirmPassword" className="text-slate-200 font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-emerald-500/50 transition-all transform hover:scale-105 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-slate-400 text-center mt-6">
              Student role is automatically assigned. Contact admin for other roles.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
