import React, { useEffect } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export function ResetPasswordPage() {
  useEffect(() => {
    document.title = "Reset Password | Personal Control Center";
  }, []);

  return <ResetPasswordForm />;
}
