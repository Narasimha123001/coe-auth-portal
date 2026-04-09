import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Home, Zap } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl opacity-10 translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl opacity-10 -translate-x-1/3 translate-y-1/3 animate-pulse"></div>

      <div className="relative z-10 text-center space-y-8 max-w-md">
        {/* Icon */}
        <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-red-500/30 transform hover:scale-110 transition-transform">
          <Zap className="h-12 w-12 text-white" />
        </div>

        {/* 404 Text */}
        <div className="space-y-4">
          <h1 className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-500">
            404
          </h1>
          <h2 className="text-3xl font-bold text-slate-100">
            Page Not Found
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Oops! The page you're looking for has wandered off into the digital void. Let's get you back on track.
          </p>
        </div>

        {/* Path Info */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-left">
          <p className="text-xs text-slate-500 font-mono">Attempted Route:</p>
          <p className="text-sm text-slate-300 font-mono break-all">{location.pathname}</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <Button asChild size="lg" className="gap-2 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105">
            <Link to="/">
              <Home className="h-4 w-4" />
              Return to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 border-slate-600 text-slate-200 hover:bg-slate-700/50">
            <Link to="/login">
              <Shield className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-slate-500">
          If you believe this is a mistake, please contact support.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
