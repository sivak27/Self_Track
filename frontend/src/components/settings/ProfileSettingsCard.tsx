import React from "react";
import { User, Mail } from "lucide-react";
import { Profile } from "@/types/settings";

interface ProfileSettingsCardProps {
  profile: Profile | null;
  fullName: string;
  onFullNameChange: (val: string) => void;
}

export function ProfileSettingsCard({
  profile,
  fullName,
  onFullNameChange,
}: ProfileSettingsCardProps) {
  return (
    <div className="rounded-2xl p-6 border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Operator Profile</h3>
          <p className="text-xs text-slate-500">Account identity and administrator credentials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder="Your Name"
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Registered Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              disabled
              value={profile?.email || ""}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
