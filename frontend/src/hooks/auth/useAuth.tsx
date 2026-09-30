import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService, AuthUser, AuthResponse } from "@/services/authService";
import { LoginInput, RegisterInput, ResetPasswordInput } from "@/validations/auth.schema";
import { Profile, UserSettings } from "@/types/settings";

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<AuthResponse>;
  register: (input: RegisterInput) => Promise<AuthResponse>;
  resetPassword: (input: ResetPasswordInput & { newPassword?: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkCurrentSession() {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setSettings(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await authService.getCurrentUser();
        if (isMounted) {
          setUser(data.user);
          setProfile(data.profile);
          setSettings(data.settings);
        }
      } catch (err) {
        console.warn("Session verification note:", err instanceof Error ? err.message : err);
        localStorage.removeItem("auth_token");
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setSettings(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkCurrentSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (input: LoginInput): Promise<AuthResponse> => {
    setError(null);
    try {
      const data = await authService.login(input);
      setUser(data.user);
      setProfile(data.profile);
      setSettings(data.settings);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      setError(msg);
      throw err;
    }
  };

  const register = async (input: RegisterInput): Promise<AuthResponse> => {
    setError(null);
    try {
      const data = await authService.register(input);
      setUser(data.user);
      setProfile(data.profile);
      setSettings(data.settings);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account";
      setError(msg);
      throw err;
    }
  };

  const resetPassword = async (input: ResetPasswordInput & { newPassword?: string }) => {
    setError(null);
    try {
      return await authService.resetPassword(input);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset password";
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err: unknown) {
      console.warn("Logout error:", err);
    } finally {
      setUser(null);
      setProfile(null);
      setSettings(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        settings,
        isLoading,
        error,
        login,
        register,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
