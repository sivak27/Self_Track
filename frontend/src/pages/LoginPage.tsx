import React, { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export function LoginPage() {
  useEffect(() => {
    document.title = "Sign In | Personal Control Center";
  }, []);

  return <LoginForm />;
}
