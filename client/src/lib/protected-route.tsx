import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Route } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  role?: "admin" | "reseller";
}

export function ProtectedRoute({ path, component: Component, role }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black to-black/95">
          <div className="flex flex-col items-center p-8 rounded-lg bg-black/40 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
            <p className="text-purple-300">Loading...</p>
          </div>
        </div>
      </Route>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // If role is specified, check if user has the required role
  if (role && user?.role !== role) {
    return (
      <Route path={path}>
        <Redirect to={user?.role === "admin" ? "/admin" : "/reseller"} />
      </Route>
    );
  }

  // If authentication and role checks pass, render the component
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}