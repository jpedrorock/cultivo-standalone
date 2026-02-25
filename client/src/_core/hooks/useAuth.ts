import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";

export function useAuth() {
  const [, navigate] = useLocation();
  const { data: user, isLoading, error } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  return {
    user: user ?? null,
    loading: isLoading,
    error: error ?? null,
    isAuthenticated: !!user,
    refresh: () => Promise.resolve(),
    logout: () => {
      window.location.href = "/api/auth/logout";
    },
  };
}
