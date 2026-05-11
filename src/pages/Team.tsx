/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Users, Copy, CheckCircle2, TrendingUp, Layers, UserPlus, LogOut, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { UserProfile, auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export default function Team({ profile, onShowAdmin }: { profile: UserProfile | null, onShowAdmin: () => void }) {
  const [copied, setCopied] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const inviteCode = profile?.referralCode || "NEON-X92F1";
  
  const isAdmin = 
    profile?.phone?.replace(/\D/g, '') === "9346507994" || 
    profile?.email === "abhigoud9346@gmail.com" ||
    auth.currentUser?.email === "abhigoud9346@gmail.com" ||
    auth.currentUser?.email === "9346507994@neonwallet.mobile";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
      setLoggingOut(false);
    }
  };

  return (
    <div className="pb-32 px-6 pt-2">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-2"
      >
        <div>
          <h1 className="text-3xl font-black italic">SYNDICATE</h1>
          <p className="text-slate-400 text-sm">Expand your network and multiply rewards.</p>
        </div>
        {isAdmin && (
          <button
            onClick={onShowAdmin}
            className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple flex items-center justify-center hover:bg-neon-purple/20 active:scale-95 transition-all"
            title="Admin OS"
          >
            <ShieldAlert size={18} />
          </button>
        )}
      </motion.div>

      {/* Invitation Card */}
      <GlassCard className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 border-blue-500/20 mb-8 p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/20 flex items-center justify-center text-neon-cyan mx-auto mb-4 border border-blue-500/20">
          <UserPlus size={40} className="animate-float" />
        </div>
        <h3 className="text-xl font-black italic mb-2 text-white">INVITE ELITE OPERATORS</h3>
        <p className="text-xs text-slate-400 mb-6 px-4">Receive instant 10% commission on every recharge made by your direct recruits.</p>
        
        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center justify-between mb-2">
          <div className="text-left">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Your Protocol Code</p>
            <p className="text-xl font-mono font-black text-white">{inviteCode}</p>
          </div>
          <button 
            onClick={handleCopy}
            className={`p-3 rounded-xl transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-slate-400 active:scale-90'}`}
          >
            {copied ? <CheckCircle2 size={24} /> : <Copy size={24} />}
          </button>
        </div>
      </GlassCard>

      {/* Network Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <GlassCard className="p-4 bg-white/5 border-white/10">
          <div className="flex items-center gap-2 mb-2 text-neon-purple">
            <Users size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Total Members</span>
          </div>
          <p className="text-2xl font-black italic">148</p>
        </GlassCard>
        <GlassCard className="p-4 bg-white/5 border-white/10">
          <div className="flex items-center gap-2 mb-2 text-neon-green">
            <TrendingUp size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Commission</span>
          </div>
          <p className="text-2xl font-black italic text-neon-green">$1,240</p>
        </GlassCard>
      </div>

      {/* Network Tiers */}
      <h3 className="text-sm font-black italic uppercase tracking-wider mb-4 opacity-60">NETWORK LAYERS</h3>
      <div className="space-y-4 mb-8">
        {[
          { level: 'Alpha', members: 12, rate: '10%', color: 'border-neon-cyan text-neon-cyan', bg: 'bg-neon-cyan/5' },
          { level: 'Beta', members: 45, rate: '5%', color: 'border-neon-purple text-neon-purple', bg: 'bg-neon-purple/5' },
          { level: 'Gamma', members: 91, rate: '2%', color: 'border-slate-500 text-slate-400', bg: 'bg-white/5' },
        ].map((tier, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`p-5 rounded-3xl border-2 ${tier.color} ${tier.bg} flex items-center justify-between group cursor-pointer hover:bg-opacity-10 transition-all`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/20">
                <Layers size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black italic leading-none">{tier.level} Tier</h4>
                <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">{tier.members} Active Members</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black italic">{tier.rate}</span>
              <p className="text-[10px] uppercase font-bold text-slate-500">Comm.</p>
            </div>
          </motion.div>
        ))}
      </div>

      <NeonButton variant="outline" fullWidth onClick={() => {}} className="mb-4">
        VIEW SYNDICATE MAP
      </NeonButton>

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black italic hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-50"
      >
        <LogOut size={20} />
        {loggingOut ? 'SIGNING OUT...' : 'LOG OUT PROTOCOL'}
      </button>
    </div>
  );
}
