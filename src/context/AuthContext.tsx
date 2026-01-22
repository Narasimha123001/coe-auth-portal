import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  registerNumber: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser({
            registerNumber: decoded.registerNumber,
            email: decoded.email,
            role: decoded.role?.toLowerCase(),
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(newToken);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({
        registerNumber: decoded.registerNumber,
        email: decoded.email,
        role: decoded.role?.toLowerCase(),
      });
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
