import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center gradient-subtle p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
            <Shield className="h-9 w-9 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign up for COE Authentication System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Name</Label>
              <Input
                id="username"
                type="text"
                placeholder="Your full name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gmail">Gmail</Label>
              <Input
                id="gmail"
                type="email"
                placeholder="your.email@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                type="text"
                value={role}
                disabled={true}
                className="h-11 bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Role is fixed as Student
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registerNumber">Register Number</Label>
              <Input
                id="registerNumber"
                type="number"
                placeholder="0000000000"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>
            <Button 
              type="button"
              variant="outline"
              className="w-full h-11 text-base"
              disabled={isLoading}
              asChild
            >
              <Link to="/login" className="flex items-center justify-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
