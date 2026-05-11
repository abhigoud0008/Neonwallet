/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Landmark, Globe, CheckCircle, Clock, XCircle, ChevronDown, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { UserProfile, createTransaction } from '../lib/firebase';

export default function Withdraw({ profile, onBack }: { profile: UserProfile | null, onBack: () => void }) {
  const [method, setMethod] = useState('UPI Transfer');
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const balance = profile?.balance || 0;

  const handleWithdraw = async () => {
    if (!profile?.uid || loading) return;
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < 200) {
      setError("Minimum withdrawal amount is 200 rs.");
      return;
    }

    if (!upiId.trim() && method === 'UPI Transfer') {
      setError("Please enter your UPI ID.");
      return;
    }

    if (numAmount > balance) {
      setError("Insufficient balance.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createTransaction(profile.uid, {
        uid: profile.uid,
        type: 'withdrawal',
        amount: numAmount,
        upiId: upiId,
        description: `Withdrawal via ${method}`,
        status: 'pending' // Withdrawals usually stay pending for review
      });
      setSuccess(true);
      setTimeout(() => onBack(), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Withdrawal failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-amber-100"
        >
          <Clock size={48} />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-800 uppercase italic">Request Sent!</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your withdrawal is being processed by the nodal center.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 pt-2 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500">
           <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black text-slate-800">Withdrawal</h1>
        <div className="w-10" />
      </div>

      <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner">
        <button className="flex-1 py-3 bg-blue-500 text-white font-black rounded-xl text-lg shadow-sm">Withdraw</button>
        <button className="flex-1 py-3 text-slate-400 font-black rounded-xl text-lg">Status</button>
      </div>

      {/* Stats Summary */}
      <div className="orange-gradient rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-100 relative overflow-hidden">
        <div className="absolute -left-4 -bottom-4 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="grid grid-cols-2 gap-4 relative z-10">
           <div>
              <p className="text-[10px] font-bold text-white/80 uppercase mb-1">Available balance</p>
              <p className="text-4xl font-black italic tracking-tighter">∫ {balance.toLocaleString()}</p>
           </div>
           <div>
              <p className="text-[10px] font-bold text-white/80 uppercase mb-1">Total Spent</p>
              <p className="text-3xl font-black italic opacity-60">∫ {profile?.totalWithdrawals || 0}</p>
           </div>
        </div>
      </div>

      {/* Select Node */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Select Active Node</h3>
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm opacity-50 grayscale">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Withdraw code <span className="text-slate-800">CWH-SYND-01</span></p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Node Integrity <span className="text-green-500 font-black">99.9%</span></p>
              <p className="text-2xl font-black italic text-primary">Channel: BANK-X1</p>
            </div>
            <div className="bg-slate-100 text-slate-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
              Standard
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Select Method</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
              {method === 'USDT-TRC20' ? <Globe size={20} /> : <Landmark size={20} />}
            </div>
            <select 
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full h-16 pl-12 pr-10 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-slate-800 appearance-none shadow-sm transition-all"
            >
              <option>UPI Transfer</option>
              <option>Bank Transfer</option>
              <option>USDT-TRC20</option>
            </select>
            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {method === 'UPI Transfer' && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">UPI ID</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="example@ybl"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full h-16 px-6 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-slate-800 shadow-sm uppercase placeholder:normal-case"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary text-xl">∫</span>
            <input 
              type="number" 
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-16 pl-10 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-slate-800 shadow-sm"
              min="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Syndicate Pin</label>
          <div className="flex gap-2">
            <input 
              type="password" 
              placeholder="••••"
              maxLength={4}
              className="flex-1 h-16 px-6 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary font-bold text-slate-800 shadow-sm text-center tracking-[1em]"
            />
            <button className="bg-orange-50 text-primary h-16 px-6 rounded-2xl font-black text-xs uppercase tracking-widest border border-orange-100">Verify</button>
          </div>
        </div>

        <button 
          onClick={handleWithdraw}
          disabled={loading}
          className="btn-orange w-full h-18 text-xl uppercase tracking-[0.3em] mt-4 shadow-2xl shadow-orange-200 disabled:opacity-50"
        >
          {loading ? "Transmitting..." : "CONFIRM"}
        </button>
      </div>
    </div>
  );
}
