import React from "react";
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <Outlet />
    </div>
  );
}
