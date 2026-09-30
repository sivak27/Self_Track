import { apiClient } from "./apiClient";
import { LoginInput, RegisterInput, ResetPasswordInput } from "@/validations/auth.schema";
import { Profile, UserSettings } from "@/types/settings";

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  token?: string;
  profile: Profile;
  settings: UserSettings;
}

export const authService = {
  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    const data = await apiClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    if (data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    return data;
  },

  async register({ email, password, fullName }: RegisterInput): Promise<AuthResponse> {
    const data = await apiClient.post<AuthResponse>("/auth/register", {
      email,
      password,
      fullName,
    });

    if (data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    return data;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    return apiClient.get<AuthResponse>("/auth/me");
  },

  async resetPassword(input: ResetPasswordInput & { newPassword?: string }): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>("/auth/reset-password", input);
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      localStorage.removeItem("auth_token");
    }
  },
};
