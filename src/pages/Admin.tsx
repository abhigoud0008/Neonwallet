/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, BarChart3, Settings, ShieldAlert, CheckCircle, XCircle, Search, RefreshCcw, Save, Lock, ArrowRight, ClipboardList, ArrowLeft } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { 
  UserProfile, 
  Transaction, 
  getAllUsers, 
  getPendingTransactions, 
  updateTransactionStatus, 
  getAppSettings, 
  updateAppSettings,
  AppSettings
} from '../lib/firebase';

export default function Admin({ onBack }: { onBack: () => void }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingTxs, setPendingTxs] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ upiId: '', payeeName: '' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.toLowerCase() === 'admin' && password === '9346507994') {
      setIsAuthorized(true);
      setAuthError('');
    } else {
      setAuthError('INVALID ACCESS CREDENTIALS');
    }
  };

  const fetchData = async () => {
    if (!isAuthorized) return;
    setRefreshing(true);
    try {
      const [u, t, s] = await Promise.all([
        getAllUsers(),
        getPendingTransactions(),
        getAppSettings()
      ]);
      setUsers(u);
      setPendingTxs(t);
      setSettings(s);
    } catch (error) {
      console.error("Admin data fetch failed", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchData();
    }
  }, [isAuthorized]);

  const handleAction = async (uid: string, txId: string, status: 'completed' | 'failed') => {
    try {
      await updateTransactionStatus(uid, txId, status);
      // Remove from pending list locally
      setPendingTxs(prev => prev.filter(t => t.id !== txId));
      fetchData(); // Refresh to catch balance changes
    } catch (error) {
      alert("Action failed");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateAppSettings(settings);
      alert("Settings updated");
    } catch (error) {
      alert("Save failed");
    }
  };

  const filteredUsers = users.filter(u => 
    u.phone?.includes(search) || u.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <GlassCard className="w-full max-w-sm p-8 bg-black/60 border-neon-purple/20">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-neon-purple/20 flex items-center justify-center text-neon-purple mb-4 border border-neon-purple/30">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Admin Gateway</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Level 4 Clearance Required</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Username</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-neon-purple/50 transition-all"
                placeholder="Enter Identity..."
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-neon-purple/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {authError && (
              <p className="text-[9px] font-black text-red-500 text-center animate-pulse uppercase tracking-widest">{authError}</p>
            )}

            <button 
              type="submit"
              className="w-full py-4 rounded-xl bg-neon-purple text-white text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:bg-neon-purple/80 transition-all active:scale-95 mt-4"
            >
              AUTHENTICATE <ArrowRight size={16} />
            </button>
            <button 
              type="button"
              onClick={onBack}
              className="w-full text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors py-2"
            >
              Return to Sector
            </button>
          </form>
        </GlassCard>
      </div>
    );
  }

  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-neon-purple/20 border-t-neon-purple rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Decrypting System Files...</p>
      </div>
    );
  }

  return (
    <div className="pb-32 px-6 pt-2">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/5 hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black italic text-neon-purple uppercase leading-none">Admin OS</h1>
            <p className="text-slate-500 text-[10px] font-black tracking-[0.2em] mt-1">
              {refreshing ? 'SYNCHRONIZING...' : 'SYSTEM OVERRIDE ACTIVE'}
            </p>
          </div>
        </div>
        <button 
          onClick={fetchData}
          className={`w-12 h-12 rounded-2xl bg-neon-purple/20 flex items-center justify-center text-neon-purple border border-neon-purple/20 transition-all ${refreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCcw size={24} />
        </button>
      </motion.div>

      {/* Global Config */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black italic uppercase tracking-widest flex items-center gap-2">
            <Settings size={16} /> Global Config
          </h2>
          <button 
            onClick={handleSaveSettings}
            className="text-[10px] font-black uppercase text-neon-purple flex items-center gap-1 bg-neon-purple/5 px-3 py-1.5 border border-neon-purple/20 rounded-lg"
          >
            <Save size={12} /> Save
          </button>
        </div>
        <GlassCard className="p-5 space-y-4 bg-white/5 border-white/5">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase">Payout UPI ID</label>
            <input 
              value={settings.upiId}
              onChange={e => setSettings({...settings, upiId: e.target.value})}
              className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-neon-purple/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase">Payee Name</label>
            <input 
              value={settings.payeeName}
              onChange={e => setSettings({...settings, payeeName: e.target.value})}
              className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-neon-purple/50"
            />
          </div>
        </GlassCard>
      </section>

      {/* Admin Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <GlassCard className="p-5 bg-white/5 border-white/5">
          <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Total Users</p>
          <p className="text-2xl font-black italic text-white">{users.length}</p>
        </GlassCard>
        <GlassCard className="p-5 bg-white/5 border-white/5">
          <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Queue Size</p>
          <p className="text-2xl font-black italic text-neon-purple">{pendingTxs.length}</p>
        </GlassCard>
      </div>

      {/* Pending Approvals */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-black italic uppercase tracking-widest">Verification Queue</h2>
          <div className="px-3 py-1 bg-neon-purple/10 border border-neon-purple/20 rounded-full">
            <span className="text-[9px] font-black text-neon-purple uppercase">Requires Sync</span>
          </div>
        </div>

        <div className="space-y-4">
          {pendingTxs.length > 0 ? pendingTxs.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 border-white/5 bg-black/40"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    tx.type === 'deposit' || tx.type === 'task' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {tx.type === 'deposit' ? <CheckCircle size={24} /> : tx.type === 'task' ? <ClipboardList size={24} /> : <ArrowRight size={24} />}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-black text-white truncate max-w-[150px]">ID: {tx.uid.substring(0,8)}...</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                      {tx.type === 'task' ? 'ORDER/TASK' : tx.type === 'withdrawal' ? 'WITHDRAWAL' : 'DEPOSIT'} • {tx.description}
                    </p>
                    {tx.upiId && (
                      <p className="text-[10px] text-neon-purple font-black uppercase mt-1 flex items-center gap-1">
                        <ArrowRight size={10} /> {tx.upiId}
                      </p>
                    )}
                    {tx.screenshotUrl && (
                      <div className="mt-3">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Payment Proof:</p>
                        <a href={tx.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block relative group">
                          <img 
                            src={tx.screenshotUrl} 
                            alt="Payment Proof" 
                            className="w-24 h-24 object-cover rounded-xl border border-white/10 hover:border-neon-purple/50 transition-all shadow-lg"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                            <Search size={14} className="text-white" />
                          </div>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black italic ${tx.type === 'deposit' || tx.type === 'task' ? 'text-green-400' : 'text-red-400'}`}>
                    ∫ {tx.amount}
                  </p>
                  {tx.reward && (
                    <p className="text-[9px] font-bold text-neon-purple uppercase mt-0.5">
                      + Reward: ∫ {tx.reward}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleAction(tx.uid, tx.id, 'completed')}
                  className="py-3 rounded-xl bg-green-500/10 text-green-400 text-[10px] font-black uppercase hover:bg-green-500/20 transition-all border border-green-500/20"
                >
                  {tx.type === 'withdrawal' ? 'APPROVE WITHDRAW' : 'SET SUCCEED'}
                </button>
                <button 
                  onClick={() => handleAction(tx.uid, tx.id, 'failed')}
                  className="py-3 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-black uppercase hover:bg-red-500/20 transition-all border border-red-500/20"
                >
                  {tx.type === 'withdrawal' ? 'REJECT & REFUND' : 'INVALIDATE'}
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] opacity-30">
               <ShieldAlert size={40} className="text-slate-500 mb-2" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] font-slate-500">Protocol Idle</p>
            </div>
          )}
        </div>
      </section>

      {/* User Management */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-black italic uppercase tracking-widest flex items-center gap-2">
            <Users size={16} /> User Database
          </h2>
          <div className="text-slate-500">
            <BarChart3 size={20} />
          </div>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
          <input 
            type="text" 
            placeholder="Search by Phone/Name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-4 pl-12 text-xs font-bold text-white outline-none focus:border-neon-purple/50 transition-all"
          />
        </div>
        <GlassCard className="p-0 overflow-hidden border-white/5 bg-black/40">
          {filteredUsers.length > 0 ? filteredUsers.map((u) => (
            <div key={u.uid} className="flex items-center justify-between p-5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 border border-white/5 group-hover:border-neon-purple/20 group-hover:text-neon-purple transition-all">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">{u.phone || 'NO_IDENT'}</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Balance: ∫ {u.balance.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-neon-purple bg-neon-purple/10 px-2 py-0.5 rounded border border-neon-purple/10">VIP {u.vipLevel}</span>
                <Settings size={18} className="text-slate-700 group-hover:text-white transition-colors cursor-pointer" />
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-[10px] uppercase font-black text-slate-600 tracking-widest">
              No matching nodes found in databank
            </div>
          )}
        </GlassCard>
      </section>
    </div>
  );
}
