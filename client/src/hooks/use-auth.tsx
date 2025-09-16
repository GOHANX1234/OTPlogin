import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  role: "admin" | "reseller";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (role: "admin" | "reseller", username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, password: string, referralToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  
  // Direct implementation using getQueryFn to fetch session, ensuring credentials are included
  const { data, isLoading } = useQuery<{ isAuthenticated: boolean; user?: User }>({ 
    queryKey: ['/api/auth/session'],
    queryFn: async () => {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      return await response.json();
    },
    refetchOnWindowFocus: true,
    staleTime: 10 * 1000, // 10 seconds
    retry: 3
  });
  
  const isAuthenticated = data?.isAuthenticated || false;
  const user = data?.user || null;
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ 
      role, 
      username, 
      password 
    }: { 
      role: "admin" | "reseller"; 
      username: string; 
      password: string;
    }) => {
      console.log(`Attempting ${role} login with credentials...`);
      
      // Add additional headers for auth
      const response = await fetch(`/api/auth/${role}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.log('Response not OK, status:', response.status);
        let errorMessage = 'Login failed';
        
        try {
          const errorData = await response.json();
          console.log('Error data from server:', errorData);
          errorMessage = errorData.message || 'Login failed';
        } catch (parseError) {
          console.log('Failed to parse error response:', parseError);
          errorMessage = 'Login failed - Invalid credentials';
        }
        
        console.log('About to throw error with message:', errorMessage);
        const error = new Error(errorMessage);
        console.log('Created error object:', error);
        console.log('Error message property:', error.message);
        throw error;
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Login successful:', data);
      // Force refetch session after login
      queryClient.invalidateQueries({ queryKey: ['/api/auth/session'] });
    },
    onError: (error) => {
      console.error('Login error:', error);
      console.error('Login error message:', error.message);
    }
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('Attempting logout...');
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Logout successful:', data);
      // Force reset session
      queryClient.resetQueries({ queryKey: ['/api/auth/session'] });
      queryClient.setQueryData(['/api/auth/session'], { isAuthenticated: false, user: null });
      navigate('/');
    },
    onError: (error) => {
      console.error('Logout error:', error);
    }
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({ 
      username, 
      password, 
      referralToken 
    }: { 
      username: string; 
      password: string; 
      referralToken: string;
    }) => {
      console.log('Attempting registration...');
      
      const response = await fetch('/api/auth/reseller/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username, 
          password, 
          referralToken 
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.log('Registration response not OK, status:', response.status);
        let errorMessage = 'Registration failed';
        
        try {
          const errorData = await response.json();
          console.log('Registration error data from server:', errorData);
          errorMessage = errorData.message || 'Registration failed';
        } catch (parseError) {
          console.log('Failed to parse registration error response:', parseError);
          errorMessage = 'Registration failed - Please try again';
        }
        
        console.log('About to throw registration error with message:', errorMessage);
        const error = new Error(errorMessage);
        console.log('Created registration error object:', error);
        console.log('Registration error message property:', error.message);
        throw error;
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Registration successful:', data);
      navigate('/');
    },
    onError: (error) => {
      console.error('Registration error:', error);
    }
  });
  
  // Redirect based on auth state
  useEffect(() => {
    if (isLoading) return;
    
    const publicPaths = ['/', '/register'];
    const adminPaths = ['/admin', '/admin/resellers', '/admin/tokens', '/admin/api'];
    const resellerPaths = ['/reseller', '/reseller/generate', '/reseller/keys', '/reseller/api'];
    
    // If authenticated, redirect from public pages to dashboard
    if (isAuthenticated && publicPaths.includes(location)) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'reseller') {
        navigate('/reseller');
      }
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated && ![...publicPaths].includes(location)) {
      navigate('/');
    }
    
    // If authenticated but wrong role, redirect to appropriate dashboard
    if (isAuthenticated) {
      if (user?.role === 'admin' && resellerPaths.some(path => location.startsWith(path))) {
        navigate('/admin');
      } else if (user?.role === 'reseller' && adminPaths.some(path => location.startsWith(path))) {
        navigate('/reseller');
      }
    }
  }, [isAuthenticated, location, isLoading, user]);
  
  // Auth methods
  const login = async (role: "admin" | "reseller", username: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ role, username, password });
    } catch (error) {
      console.error('Login method error:', error);
      throw error; // Re-throw to allow components to catch it
    }
  };
  
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout method error:', error);
      throw error;
    }
  };
  
  const register = async (username: string, password: string, referralToken: string) => {
    try {
      await registerMutation.mutateAsync({ username, password, referralToken });
    } catch (error) {
      console.error('Register method error:', error);
      throw error; // Re-throw to allow components to catch it
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
