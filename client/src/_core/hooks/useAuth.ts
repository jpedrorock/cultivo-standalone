// Simplified auth hook for standalone deployment (no authentication)
export function useAuth() {
  // Always return authenticated state without actual authentication
  return {
    user: { id: 1, name: "Local User", email: "user@local" },
    loading: false,
    error: null,
    isAuthenticated: true,
    refresh: () => Promise.resolve(),
    logout: () => Promise.resolve(),
  };
}
