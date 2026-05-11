/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, ArrowDown, LayoutGrid, ClipboardList, Users, ClipboardCheck, ChevronRight } from 'lucide-react';

import { UserProfile, Transaction, subscribeToTransactions } from '../lib/firebase';

export default function Dashboard({ onShowHistory, onTabChange, profile }: { 
  onShowHistory: () => void, 
  onTabChange: (tab: string) => void,
  profile: UserProfile | null 
}) {
  const balance = profile?.balance || 0;
  const deposit = profile?.totalDeposits || 0;
  const withdrawal = profile?.totalWithdrawals || 0;
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBonusOverlay, setShowBonusOverlay] = useState(false);

  useEffect(() => {
    // Check if user just joined and has exactly 155 balance (and only one transaction)
    if (profile && profile.balance === 155 && transactions.length === 1 && !localStorage.getItem(`bonus_shown_${profile.uid}`)) {
      setShowBonusOverlay(true);
      localStorage.setItem(`bonus_shown_${profile.uid}`, 'true');
    }
  }, [profile, transactions]);

  useEffect(() => {
    if (profile?.uid) {
      const unsubscribe = subscribeToTransactions(profile.uid, (txs) => {
        setTransactions(txs.slice(0, 2)); // Only show top 2 on dashboard
      });
      return () => unsubscribe();
    }
  }, [profile?.uid]);

  return (
    <div className="pb-32 px-4 pt-2 space-y-5">
      {/* Balance Card */}
      <div className="orange-gradient rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-orange-100">
        <div className="absolute -right-4 -top-4 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-4">
          <p className="text-white/80 font-semibold">Available Balance</p>
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-black tracking-tight">∫ {balance.toLocaleString()}</h1>
            <button 
              onClick={onShowHistory}
              className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full font-bold text-sm hover:bg-white/30 transition-colors"
            >
              Detail
            </button>
          </div>
          <div className="pt-2 flex gap-3">
             <button 
               onClick={() => onTabChange('deposit')}
               className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all"
             >
               Deposit
             </button>
             <button 
               onClick={() => onTabChange('withdraw')}
               className="flex-1 bg-white text-orange-600 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg"
             >
               Withdraw
             </button>
          </div>
        </div>
      </div>

      {/* Deposit/Withdraw summary */}
      <div className="orange-gradient rounded-[2rem] p-1 flex items-center shadow-lg shadow-orange-100">
        <div className="flex-1 flex flex-col items-center py-4 border-r border-white/20">
          <div className="flex items-center gap-1 text-white/90 text-sm font-bold mb-1">
            <ArrowUp size={16} /> <span>Deposit</span>
          </div>
          <p className="text-xl font-black text-white">∫ {deposit.toLocaleString()}</p>
        </div>
        <div className="flex-1 flex flex-col items-center py-4">
          <div className="flex items-center gap-1 text-white/90 text-sm font-bold mb-1">
            <ArrowDown size={16} /> <span>Withdrawal</span>
          </div>
          <p className="text-xl font-black text-white">∫ {withdrawal.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: LayoutGrid, label: 'USDT', badge: '106INR', tab: 'statistics' },
          { icon: ClipboardList, label: 'Task', tab: 'payment' },
          { icon: Users, label: 'Team', tab: 'my' },
          { icon: ClipboardCheck, label: 'Order', onClick: onShowHistory },
        ].map((action, i) => (
          <div 
            key={i} 
            onClick={action.onClick ? action.onClick : () => onTabChange(action.tab || 'home')}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 shadow-sm relative group-hover:bg-orange-50 transition-colors">
              <action.icon size={28} />
              {action.badge && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
                  {action.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{action.label}</span>
          </div>
        ))}
      </div>

      {/* Newcomer Rewards Banner */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-[2rem] p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-white/10 blur-2xl -rotate-12 translate-x-12" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-80">NEWCOMER REWARDS</span>
            <span className="text-[10px] font-black uppercase bg-blue-400/40 px-2 py-1 rounded-md">Multi-Day Task</span>
          </div>
          <h2 className="text-3xl font-black italic mb-1 uppercase tracking-tight">In progress</h2>
          <h2 className="text-xl font-bold mb-4">Complete daily paid tasks to claim rewards.</h2>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold text-sm shadow-lg">
            View details
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Transactions</h3>
          <button onClick={onShowHistory} className="text-primary text-sm font-bold flex items-center">
            See All <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.map((tx) => {
              const IsPositive = tx.type === 'deposit' || tx.type === 'task' || tx.type === 'referral';
              return (
                <div key={tx.id} className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${IsPositive ? 'bg-green-50' : 'bg-red-50'} flex items-center justify-center ${IsPositive ? 'text-green-500' : 'text-red-500'} shadow-md ${IsPositive ? 'shadow-green-100' : 'shadow-red-100'}`}>
                      <span className="font-bold text-xl">{IsPositive ? '+' : '-'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">{tx.description || tx.type}</h4>
                      <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                        {tx.createdAt?.toDate().toLocaleString() || 'Syncing...'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold leading-none mb-1 text-lg ${IsPositive ? 'text-green-600' : 'text-red-600'}`}>
                      ∫ {tx.amount.toLocaleString()}
                    </p>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${tx.status === 'completed' ? 'text-cyan-500' : 'text-orange-500'}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-2 opacity-60">
              <ClipboardList className="text-slate-300" size={32} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Recent Transactions</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showBonusOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-8 w-full max-w-sm text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400" />
              
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <LayoutGrid className="text-orange-500" size={48} />
              </div>

              <h2 className="text-3xl font-black italic text-slate-800 mb-2 uppercase tracking-tight">Welcome Bonus!</h2>
              <p className="text-slate-500 text-sm font-medium mb-6">
                You've received a newcomer reward to start your journey in the Syndicate.
              </p>

              <div className="bg-orange-50 rounded-2xl p-4 mb-8">
                <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em]">Amount Received</span>
                <p className="text-5xl font-black text-orange-500">∫ 155</p>
              </div>

              <button 
                onClick={() => setShowBonusOverlay(false)}
                className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black italic uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
              >
                Accept Reward
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
