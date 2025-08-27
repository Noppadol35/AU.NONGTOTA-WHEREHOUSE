"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && requiredRole && !requiredRole.includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, loading, requiredRole, router]);

  if (loading) {
    return <LoadingSpinner size="lg" text="กำลังตรวจสอบสิทธิ์..." />;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return null; // Will redirect to dashboard
  }

  return <>{children}</>;
}
