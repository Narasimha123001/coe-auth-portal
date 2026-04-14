import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff, AlertCircle, Lock, Mail, User, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [username, setUsername] = useState('');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  
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

  // Password strength calculator
  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    return Math.min(strength, 4);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
    if (errors.password) {
      setErrors({ ...errors, password: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = 'Full name is required';
    }

    if (!registerNumber.trim()) {
      newErrors.registerNumber = 'Register number is required';
    } else if (isNaN(Number(registerNumber))) {
      newErrors.registerNumber = 'Register number must be valid';
    }

    if (!gmail.trim()) {
      newErrors.gmail = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@(gmail\.com|klu\.ac\.in)$/;
      if (!emailRegex.test(gmail)) {
        newErrors.gmail = 'Use Gmail or KLU university email';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 2) {
      newErrors.password = 'Password too weak. Mix uppercase, numbers, symbols';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
      
      toast.success('🎉 Registration successful! Redirecting to login...');
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

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-slate-400';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-yellow-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500 to-cyan-400 rounded-full blur-3xl opacity-15 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-400 rounded-full blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      {/* Left Section - Benefits (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start p-12 relative z-10">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">COE Portal</h1>
              <p className="text-xs text-cyan-300 font-light">Registration</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Join <span className="bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">5000+ Students</span>
          </h2>
          
          <p className="text-slate-300 mb-12 leading-relaxed text-lg">
            Register your account and access your exam schedules, appointments, and academic information securely.
          </p>

          {/* Benefits List */}
          <div className="space-y-5">
            {[
              { icon: '⚡', text: 'Instant Account Activation', color: 'from-emerald-500' },
              { icon: '🔒', text: 'Enterprise Security', color: 'from-cyan-500' },
              { icon: '📱', text: 'Access Anytime, Anywhere', color: 'from-purple-500' },
              { icon: '✓', text: 'No Hidden Charges', color: 'from-pink-500' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${feature.color} to-transparent flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-emerald-500/50 transition-all text-lg`}>
                  {feature.icon}
                </div>
                <span className="text-slate-200 font-medium group-hover:text-white transition-colors">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Registration Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link to="/login" className="inline-flex items-center text-slate-400 hover:text-cyan-300 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>

          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-400 flex items-center justify-center mb-4 shadow-2xl shadow-emerald-500/50">
              <Shield className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-cyan-300 text-xs font-light tracking-widest">JOIN COE PORTAL</p>
          </div>

          {/* Registration Card */}
          <div className="relative group">
            {/* Gradient border glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 animate-pulse"></div>
            
            <div className="relative bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-emerald-400/40 p-8 space-y-6">
              
              {/* Header */}
              <div className="hidden lg:block space-y-1">
                <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
                <p className="text-slate-400 text-sm">Fill in your details to get started</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Full Name Input */}
                <div className="space-y-2">
                  <label className="text-white font-semibold text-sm flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-400" />
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errors.username) setErrors({ ...errors, username: '' });
                      }}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition-all text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                        errors.username
                          ? 'border-red-400/50 focus:ring-red-400/30 focus:border-red-400'
                          : 'border-emerald-400/30 focus:ring-emerald-400/30 focus:border-emerald-400'
                      } hover:border-emerald-400/50 disabled:opacity-50`}
                    />
                    {errors.username && <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-red-400" />}
                  </div>
                  {errors.username && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.username}</p>}
                </div>

                {/* Register Number Input */}
                <div className="space-y-2">
                  <label className="text-white font-semibold text-sm flex items-center gap-2">
                    <Hash className="h-4 w-4 text-emerald-400" />
                    Register Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="1234567890"
                      value={registerNumber}
                      onChange={(e) => {
                        setRegisterNumber(e.target.value);
                        if (errors.registerNumber) setErrors({ ...errors, registerNumber: '' });
                      }}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition-all text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                        errors.registerNumber
                          ? 'border-red-400/50 focus:ring-red-400/30 focus:border-red-400'
                          : 'border-emerald-400/30 focus:ring-emerald-400/30 focus:border-emerald-400'
                      } hover:border-emerald-400/50 disabled:opacity-50`}
                    />
                    {errors.registerNumber && <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-red-400" />}
                  </div>
                  {errors.registerNumber && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.registerNumber}</p>}
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-white font-semibold text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-400" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="you@college.ac.in"
                      value={gmail}
                      onChange={(e) => {
                        setGmail(e.target.value);
                        if (errors.gmail) setErrors({ ...errors, gmail: '' });
                      }}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition-all text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                        errors.gmail
                          ? 'border-red-400/50 focus:ring-red-400/30 focus:border-red-400'
                          : 'border-emerald-400/30 focus:ring-emerald-400/30 focus:border-emerald-400'
                      } hover:border-emerald-400/50 disabled:opacity-50`}
                    />
                    {errors.gmail && <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-red-400" />}
                  </div>
                  {errors.gmail && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.gmail}</p>}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-white font-semibold text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4 text-emerald-400" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={() => {
                        if (password && password.length < 8) {
                          setErrors({ ...errors, password: 'Password must be at least 8 characters' });
                        }
                      }}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition-all text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                        errors.password
                          ? 'border-red-400/50 focus:ring-red-400/30 focus:border-red-400'
                          : 'border-emerald-400/30 focus:ring-emerald-400/30 focus:border-emerald-400'
                      } hover:border-emerald-400/50 disabled:opacity-50`}
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
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div className={`h-full ${getPasswordStrengthColor()} transition-all w-1/4 ${passwordStrength > 0 ? 'w-1/4' : ''} ${passwordStrength > 1 ? 'w-2/4' : ''} ${passwordStrength > 2 ? 'w-3/4' : ''} ${passwordStrength > 3 ? 'w-full' : ''}`}></div>
                    </div>
                    <span className={`text-xs font-medium ${getPasswordStrengthColor() === 'bg-red-500' ? 'text-red-400' : getPasswordStrengthColor() === 'bg-yellow-500' ? 'text-yellow-400' : getPasswordStrengthColor() === 'bg-blue-500' ? 'text-blue-400' : 'text-green-400'}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.password}</p>}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label className="text-white font-semibold text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4 text-emerald-400" />
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                      }}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition-all text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                        errors.confirmPassword
                          ? 'border-red-400/50 focus:ring-red-400/30 focus:border-red-400'
                          : 'border-emerald-400/30 focus:ring-emerald-400/30 focus:border-emerald-400'
                      } hover:border-emerald-400/50 disabled:opacity-50`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.confirmPassword}</p>}
                </div>

                {/* Agreement Checkbox */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="agree"
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-emerald-400/50 bg-slate-800/50 cursor-pointer accent-emerald-400 disabled:opacity-50 mt-1"
                  />
                  <label htmlFor="agree" className="text-slate-300 text-sm cursor-pointer hover:text-white transition-colors">
                    I agree to the <a href="#" className="text-emerald-400 hover:underline">Terms & Conditions</a> and <a href="#" className="text-emerald-400 hover:underline">Privacy Policy</a>
                  </label>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-6 bg-gradient-to-r from-emerald-500 to-cyan-400 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>

                {/* Already have account */}
                <div className="text-center pt-2">
                  <p className="text-slate-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>

              {/* Footer */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-center text-slate-500 text-xs">
                  Student role is automatically assigned. Contact admin for other roles.
                </p>
              </div>
            </div>
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

export default Register;
