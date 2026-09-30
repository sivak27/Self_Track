import React, { useEffect } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export function RegisterPage() {
  useEffect(() => {
    document.title = "Register | Personal Control Center";
  }, []);

  return <RegisterForm />;
}
