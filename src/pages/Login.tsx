import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      const dashboardMap: Record<string, string> = {
        admin: '/admin/dashboard',
        staff: '/staff/dashboard',
        student: '/student/dashboard',
      };
      navigate(dashboardMap[user.role?.toLowerCase()] || '/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Call login API and get token string
      const token = await authApi.login({ email, password });
      if (!token) {
        toast.error('No token received from server');
        return;
      }
      
      // 2. Store JWT token in localStorage
      localStorage.setItem("token", token);
      
      // 3. Update auth context FIRST
      login(token);
      
      // 4. Decode token and extract role
      const decoded: any = jwtDecode(token);
      const role = decoded.role?.toLowerCase();
      
      // 5. Role-based redirect
      if (role === "student") {
        navigate("/student/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "staff") {
        navigate("/staff/dashboard");
      } else {
        navigate("/");
      }
      
      toast.success("Login successful!");
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
      {/* Premium animated background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-400 rounded-full blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/50 transform hover:scale-110 transition-all duration-500">
            <Shield className="h-11 w-11 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            SecureAuth
          </h1>
          <p className="text-cyan-300 text-sm font-light tracking-widest">ENTERPRISE ACCESS CONTROL</p>
        </div>

        {/* Login Card with glow */}
        <div className="relative group">
          {/* Animated gradient border */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-500 animate-pulse"></div>
          
          <div className="relative bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-blue-400/30 p-8 space-y-8">
            
            {/* Form Header */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome</h2>
              <p className="text-slate-400 text-sm">Access your account securely</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2.5">
                <label className="text-white font-semibold text-sm">Email Address</label>
                <input
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-blue-400/30 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all hover:border-blue-400/50"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2.5">
                <label className="text-white font-semibold text-sm">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-blue-400/30 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all hover:border-blue-400/50"
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  'Login'
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-blue-400/30"></div>
                <span className="text-slate-400 text-xs font-light">NEW USER</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-blue-400/30"></div>
              </div>

              {/* Sign Up Button */}
              <Link to="/register" className="block">
                <button
                  type="button"
                  className="w-full py-3 border border-blue-400/50 text-cyan-300 font-semibold rounded-lg hover:bg-slate-800/50 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105"
                >
                  Register Account
                </button>
              </Link>
            </form>

            {/* Footer Info */}
            <p className="text-center text-slate-500 text-xs">Secure enterprise authentication</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -50px) scale(1.1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Login;
