/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bell, Copy } from 'lucide-react';
import { UserProfile } from '../lib/firebase';

export default function Header({ profile }: { profile: UserProfile | null }) {
  const userId = profile?.identityId || "------";
  const displayName = profile?.phone ? `User-${profile.phone.slice(-4)}` : "Abhigoud0008";

  const copyId = () => {
    if (userId !== "------") {
      navigator.clipboard.writeText(userId);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-app-bg sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid || 'default'}`} 
            alt="avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 leading-tight">{displayName}</h3>
          <div className="flex items-center gap-1.5" onClick={copyId}>
            <span className="text-slate-400 text-sm font-medium uppercase tracking-tight">ID: {userId}</span>
            <Copy size={12} className="text-slate-400 cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center bg-white shadow-sm">
          <Bell size={24} className="text-slate-800" />
        </div>
      </div>
    </header>
  );
}

