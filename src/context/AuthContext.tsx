import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { usersApi } from "@/api/usersApi";

interface User {
  registerNumber: string;
  email: string;
  role: string;
}

interface StudentProfile {
  registerNo: number;
  name: string;
  email: string;
  departmentName: string;
  year: number;
  phoneNo: string;
  semester: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  studentProfile: StudentProfile | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface DecodedToken {
  registerNumber: string;
  email: string;
  role: string;
  exp: number;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(storedToken);

      if (decoded.exp * 1000 > Date.now()) {
        setToken(storedToken);
        setUser({
          registerNumber: decoded.registerNumber,
          email: decoded.email,
          role: decoded.role?.toLowerCase(),
        });

        fetchStudentProfile(); // 🔥 fetch once
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
    }

    setIsLoading(false);
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const data = await usersApi.getStudentProfile();
      setStudentProfile(data);
    } catch (err) {
      console.error("Failed to fetch student profile:", err);
    }
  };

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(newToken);

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser({
        registerNumber: decoded.registerNumber,
        email: decoded.email,
        role: decoded.role?.toLowerCase(),
      });

      fetchStudentProfile(); // 🔥 fetch only once after login
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setStudentProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        studentProfile,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
