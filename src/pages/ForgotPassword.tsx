import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2, ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call - Replace with actual API endpoint
      // await forgotPasswordApi.sendResetLink({ email });
      
      // For now, just show success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      toast.success('Recovery link sent! Check your email.');
      
      // Redirect to login after 4 seconds
      setTimeout(() => {
        navigate('/login');
      }, 4000);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send recovery link. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full blur-3xl opacity-15 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-400 rounded-full blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      {/* Left Section - Info (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start p-12 relative z-10">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">COE Portal</h1>
              <p className="text-xs text-cyan-300 font-light">Password Recovery</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Can't Access Your <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Account?</span>
          </h2>
          
          <p className="text-slate-300 mb-12 leading-relaxed text-lg">
            Don't worry! We'll help you recover your account. Follow the instructions we'll send to your email.
          </p>

          {/* Steps */}
          <div className="space-y-5">
            {[
              { number: '1', text: 'Enter your email address', icon: '📧' },
              { number: '2', text: 'Check your email for recovery link', icon: '✉️' },
              { number: '3', text: 'Reset your password securely', icon: '🔐' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-blue-500/50 transition-all text-lg">
                  {step.number}
                </div>
                <div>
                  <div className="text-slate-200 font-medium group-hover:text-white transition-colors">{step.text}</div>
                  <div className="text-2xl">{step.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Security Info */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-300">
                  <span className="font-semibold">Secured:</span> Your account is protected with enterprise-grade encryption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link to="/login" className="inline-flex items-center text-slate-400 hover:text-cyan-300 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>

          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4 shadow-2xl shadow-blue-500/50">
              <Shield className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Forgot Password</h1>
            <p className="text-cyan-300 text-xs font-light tracking-widest">RECOVER YOUR ACCOUNT</p>
          </div>

          {/* Recovery Card */}
          <div className="relative group">
            {/* Gradient border glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 animate-pulse"></div>
            
            <div className="relative bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-blue-400/40 p-8 space-y-6">
              
              {/* Header */}
              <div className="hidden lg:block space-y-1">
                <h2 className="text-2xl font-bold text-white">Reset Your Password</h2>
                <p className="text-slate-400 text-sm">Enter your email to receive recovery instructions</p>
              </div>

              {submitted ? (
                // Success State
                <div className="space-y-6 py-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                      <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-500/50">
                        <CheckCircle className="h-10 w-10 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Check Your Email</h3>
                    <p className="text-slate-300 text-sm mb-4">
                      We've sent a password recovery link to <span className="font-semibold text-cyan-300">{email}</span>
                    </p>
                    <p className="text-slate-400 text-xs">
                      The link will expire in 24 hours. If you don't receive it, check your spam folder.
                    </p>
                  </div>

                  <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-lg p-4">
                    <p className="text-cyan-300 text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>Redirecting to login in a few seconds...</span>
                    </p>
                  </div>

                  <Link to="/login" className="block">
                    <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105 active:scale-95">
                      Back to Login
                    </button>
                  </Link>
                </div>
              ) : (
                // Form State
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Email Input */}
                  <div className="space-y-3">
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
                        className={`w-full px-4 py-3.5 rounded-lg bg-slate-800/50 border transition-all text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                          emailError
                            ? 'border-red-400/50 focus:ring-red-400/30 focus:border-red-400'
                            : 'border-blue-400/30 focus:ring-cyan-400/30 focus:border-cyan-400'
                        } hover:border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed text-base`}
                        autoComplete="email"
                      />
                      {emailError && (
                        <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-red-400" />
                      )}
                    </div>
                    {emailError && (
                      <p className="text-red-400 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {emailError}
                      </p>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-blue-300 flex-shrink-0 mt-0.5" />
                      <p className="text-blue-200 text-xs">
                        Make sure you have access to your registered email. We'll send the recovery link there.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-5 w-5" />
                        <span>Send Recovery Link</span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
                    <span className="text-slate-400 text-xs font-light">Remember your password?</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
                  </div>

                  {/* Back to Login */}
                  <Link to="/login" className="block">
                    <button
                      type="button"
                      className="w-full py-3 border-2 border-blue-400/50 text-cyan-300 font-semibold rounded-lg hover:bg-blue-500/10 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105 active:scale-95"
                    >
                      Back to Login
                    </button>
                  </Link>
                </form>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-center text-slate-500 text-xs">
                  Need help? <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Contact Support</a>
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

export default ForgotPassword;
