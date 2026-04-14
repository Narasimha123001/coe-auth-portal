import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
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

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(value)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    } else if (value.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);

    if (!emailValid || !passwordValid) {
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
      
      // 3. Remember email if checkbox is selected
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }
      
      // 4. Update auth context
      login(token);
      
      // 5. Decode token and extract role
      const decoded: any = jwtDecode(token);
      const role = decoded.role?.toLowerCase();
      
      // 6. Role-based redirect
      if (role === "student") {
        navigate("/student/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "staff") {
        navigate("/staff/dashboard");
      } else {
        navigate("/");
      }
      
      toast.success("Login successful! Welcome back.");
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full blur-3xl opacity-15 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-400 rounded-full blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      
      {/* Left Section - Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start p-12 relative z-10">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">COE Portal</h1>
              <p className="text-xs text-cyan-300 font-light">Secure Access System</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Manage Your <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Academic Journey</span>
          </h2>
          
          <p className="text-slate-300 mb-12 leading-relaxed text-lg">
            Access your appointments, exam schedules, and academic information in one secure platform.
          </p>

          {/* Features List */}
          <div className="space-y-5">
            {[
              { icon: '✓', text: 'Enterprise-grade Security', color: 'from-blue-500' },
              { icon: '✓', text: 'Real-time Access Control', color: 'from-cyan-500' },
              { icon: '✓', text: '24/7 System Availability', color: 'from-purple-500' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${feature.color} to-transparent flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-blue-500/50 transition-all`}>
                  {feature.icon}
                </div>
                <span className="text-slate-200 font-medium group-hover:text-white transition-colors">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-16 pt-8 border-t border-white/10">
            {[
              { label: 'Active Users', value: '5000+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-2xl font-bold text-cyan-400">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4 shadow-2xl shadow-blue-500/50">
              <Shield className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">COE Portal</h1>
            <p className="text-cyan-300 text-xs font-light tracking-widest">SECURE ACCESS SYSTEM</p>
          </div>

          {/* Login Card */}
          <div className="relative group">
            {/* Gradient border glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 animate-pulse"></div>
            
            <div className="relative bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-blue-400/40 p-8 space-y-8">
              
              {/* Header */}
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                <p className="text-slate-400 text-sm">Enter your credentials to access your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-white font-semibold text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4 text-cyan-400" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="your.email@college.ac.in"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      onBlur={() => validateEmail(email)}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition-all text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                        emailError
                          ? 'border-red-400/50 focus:ring-red-400/30 focus:border-red-400'
                          : 'border-blue-400/30 focus:ring-cyan-400/30 focus:border-cyan-400'
                      } hover:border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    {emailError && (
                      <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-red-400" />
                    )}
                  </div>
                  {emailError && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {emailError}</p>}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-white font-semibold text-sm flex items-center gap-2">
                      <Lock className="h-4 w-4 text-cyan-400" />
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                      }}
                      onBlur={() => validatePassword(password)}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition-all text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                        passwordError
                          ? 'border-red-400/50 focus:ring-red-400/30 focus:border-red-400'
                          : 'border-blue-400/30 focus:ring-cyan-400/30 focus:border-cyan-400'
                      } hover:border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {passwordError}</p>}
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-blue-400/50 bg-slate-800/50 cursor-pointer accent-cyan-400 disabled:opacity-50"
                  />
                  <label htmlFor="rememberMe" className="text-slate-300 text-sm cursor-pointer hover:text-white transition-colors">
                    Remember this email
                  </label>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-6 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Login to Dashboard</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
                  <span className="text-slate-400 text-xs font-light">No Account? Create One</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
                </div>

                {/* Sign Up Button */}
                <Link to="/register" className="block">
                  <button
                    type="button"
                    className="w-full py-3 border-2 border-blue-400/50 text-cyan-300 font-semibold rounded-lg hover:bg-blue-500/10 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    Create New Account
                  </button>
                </Link>
              </form>

              {/* Footer */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <p className="text-center text-slate-400 text-xs">
                  By logging in, you agree to our
                </p>
                <div className="flex items-center justify-center gap-3 text-xs">
                  <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Terms</a>
                  <span className="text-slate-600">•</span>
                  <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Privacy</a>
                  <span className="text-slate-600">•</span>
                  <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Support</a>
                </div>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: '🔒', text: 'Encrypted' },
              { icon: '⚡', text: 'Fast' },
              { icon: '✓', text: 'Secure' },
            ].map((item, idx) => (
              <div key={idx} className="text-center p-3 rounded-lg bg-white/5 border border-white/10 hover:border-blue-400/30 transition-all">
                <div className="text-xl mb-1">{item.icon}</div>
                <p className="text-xs text-slate-400">{item.text}</p>
              </div>
            ))}
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
