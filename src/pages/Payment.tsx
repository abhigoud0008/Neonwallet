/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, BarChart2, CheckCircle, Clock } from 'lucide-react';
import { UserProfile, createTransaction, getAppSettings, AppSettings } from '../lib/firebase';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

export default function Payment({ profile }: { profile: UserProfile | null }) {
  const balance = profile?.balance || 0;
  const [claimingItem, setClaimingItem] = useState<{ amount: number, income: number, code: string } | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAppSettings().then(setSettings);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openPaymentModal = (item: { amount: number, income: number, code: string }, index: number) => {
    setClaimingItem(item);
    setClaimingId(index);
    setScreenshot(null);
  };

  const handlePay = () => {
    if (!settings || !claimingItem) return;
    const upiUrl = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.payeeName)}&am=${claimingItem.amount}&cu=INR&tn=NeonSyndicate_Claim_${claimingItem.code}_${profile?.uid.substring(0,6)}`;
    window.location.href = upiUrl;
  };

  const handleSubmit = async () => {
    if (!profile?.uid || !claimingItem || !screenshot || !settings) return;
    
    setIsSubmitting(true);
    try {
      await createTransaction(profile.uid, {
        uid: profile.uid,
        type: 'task',
        amount: claimingItem.amount + claimingItem.income,
        reward: claimingItem.income,
        orderCode: claimingItem.code,
        screenshotUrl: screenshot, // In a real app, upload to storage first
        description: `Order Reward Claim (${claimingItem.code})`,
        status: 'pending' 
      });
      setSuccessMsg(`Processing claim for ${claimingItem.code}. Awaiting verification.`);
      setClaimingItem(null);
      setClaimingId(null);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-32 px-4 pt-2 space-y-6 relative">
      <h1 className="text-3xl font-black text-center text-slate-800 uppercase italic tracking-tighter">Market</h1>

      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-green-100"
        >
          <CheckCircle size={20} />
          <p className="text-xs font-black uppercase tracking-widest">{successMsg}</p>
        </motion.div>
      )}

      {/* Reward Summary Card */}
      <div className="orange-gradient rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-orange-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-white/80 font-bold text-sm mb-1">Cashback</p>
            <h2 className="text-5xl font-black">4%</h2>
          </div>
          <div className="flex items-end gap-1 h-16">
            {[30, 60, 45, 90, 50, 70].map((h, i) => (
              <div 
                key={i} 
                className="w-4 bg-white/30 rounded-t-sm" 
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
            <p className="text-[10px] font-bold text-white/70 uppercase mb-1">Balance</p>
            <p className="text-xl font-black leading-none">∫ {balance.toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex justify-between items-center">
              <div>
                <p className="text-[8px] font-bold text-white/70 uppercase leading-none mb-1">Reward</p>
                <p className="text-lg font-black leading-none">∫ 2785</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex justify-between items-center">
              <div>
                <p className="text-[8px] font-bold text-white/70 uppercase leading-none mb-1">Pending</p>
                <p className="text-lg font-black leading-none">∫ 0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center gap-3 text-orange-600">
        <AlertCircle size={20} />
        <p className="text-[11px] font-bold leading-tight">
          Please use Freecharge or Mobikwik wallet for payment!
        </p>
      </div>

      {/* Tabs / Filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {['All Tasks', '100-500', '500-1000', '1000-2500'].map((tab, i) => (
          <button 
            key={tab} 
            className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap shadow-sm border transition-all ${
              i === 0 ? 'orange-gradient text-white border-transparent' : 'bg-slate-100 text-slate-500 border-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {[
          { amount: 100, income: 4, code: 'pFihiD' },
          { amount: 200, income: 8, code: 'gLAEN3' },
          { amount: 300, income: 12, code: '3aOsXA' },
          { amount: 500, income: 20, code: '9HRsEh' },
          { amount: 799, income: 31.96, code: 'zH7bS2' },
          { amount: 680, income: 27.2, code: 'xK9vL5' },
          { amount: 1200, income: 48, code: 'mR4nQ8' },
          { amount: 1008, income: 40.32, code: 'kV2wZ1' },
          { amount: 2009, income: 80.36, code: 'jP5mX3' },
          { amount: 2599, income: 103.96, code: 'rY9tC6' },
        ].map((item, i) => (
          <div key={i} className="premium-card p-5 relative group">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-primary italic mb-1 leading-none">INR</h3>
                <p className="text-slate-400 font-bold text-sm">Amount: <span className="text-primary">∫ {item.amount}</span></p>
                <p className="text-slate-400 font-bold text-sm">Reward: <span className="text-primary">+{item.income}</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tighter">
                  Code <span className="text-primary">{item.code}</span>
                </p>
                <button 
                  onClick={() => openPaymentModal(item, i)}
                  disabled={claimingId !== null}
                  className="btn-orange px-8 disabled:opacity-50"
                >
                  {claimingId === i && claimingItem ? "..." : "Reward"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {claimingItem && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setClaimingItem(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-3xl p-8 relative z-10 shadow-2xl overflow-hidden"
          >
            <button 
              onClick={() => setClaimingItem(null)}
              className="absolute right-6 top-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-primary flex items-center justify-center mx-auto mb-4">
                  <BarChart2 size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase italic">Active Task</h2>
                <p className="text-slate-500 font-bold">Code: {claimingItem.code}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold">Invest Amount</span>
                  <span className="text-slate-800 font-black">∫ {claimingItem.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary font-bold">Expected Reward</span>
                  <span className="text-primary font-black">+∫ {claimingItem.income}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between">
                  <span className="text-slate-400 text-xs font-bold uppercase">Total Return</span>
                  <span className="text-lg font-black text-slate-800">∫ {claimingItem.amount + claimingItem.income}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handlePay}
                  className="w-full h-16 premium-card flex items-center justify-center gap-3 bg-orange-500 text-white font-black uppercase italic tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-orange-200"
                >
                  Go Pay ∫ {claimingItem.amount}
                </button>

                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className={`w-full h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${screenshot ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                    {screenshot ? (
                      <>
                        <CheckCircle className="text-green-500" size={24} />
                        <span className="text-[10px] font-black text-green-600 uppercase">Screenshot Loaded</span>
                      </>
                    ) : (
                      <>
                        <Camera className="text-slate-400" size={24} />
                        <span className="text-[10px] font-black text-slate-400 uppercase">Upload Screenshot</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={!screenshot || isSubmitting}
                className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest disabled:opacity-50 disabled:bg-slate-200 transition-all shadow-xl shadow-slate-200"
              >
                {isSubmitting ? "Submitting..." : "Submit Proof"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
