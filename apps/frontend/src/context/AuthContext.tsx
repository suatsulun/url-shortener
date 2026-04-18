import { api } from "@/lib/api";
import { createContext, useState, useEffect } from "react";

export interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
}

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = async (loginName: string, password: string) => {
      const response = await api.post("/users/login", { loginName, password });
      if (response.status === 200) {
        const data: User = response.data;
        setUser(data);
      }
  };

  const logout = async () => {
      const response = await api.post("/users/logout");
      if (response.status === 200) {
        setUser(null);
      }
  };

  const register = async (username: string, email: string, password: string) => {
      const response = await api.post("/users/register", { username, email, password });
      if (response.status === 201) {
        const data: User = response.data;
        setUser(data);
      }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/users/me");
       if (response.status === 200) {
          const data: User = response.data;
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
