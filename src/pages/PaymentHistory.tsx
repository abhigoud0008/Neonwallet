/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle, XCircle, Clock, ClipboardList, ChevronRight } from 'lucide-react';
import { UserProfile, Transaction, subscribeToTransactions } from '../lib/firebase';
import { useState, useEffect } from 'react';

export default function PaymentHistory({ onBack, profile }: { onBack: () => void, profile: UserProfile | null }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'receive' | 'purchase'>('purchase');
  const [currency, setCurrency] = useState<'INR' | 'USDT'>('INR');

  useEffect(() => {
    if (!profile?.uid) return;

    const unsubscribe = subscribeToTransactions(profile.uid, (txs) => {
      setTransactions(txs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  const balance = profile?.balance || 0;
  
  // Calculate stats from transactions
  const totalReward = transactions
    .filter(tx => tx.type === 'task' && tx.status === 'completed')
    .reduce((sum, tx) => sum + (tx.reward || 0), 0);
    
  const pendingAmount = transactions
    .filter(tx => tx.status === 'pending')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'purchase') {
      return tx.type === 'task';
    } else {
      return tx.type === 'deposit' || tx.type === 'withdrawal' || tx.type === 'referral';
    }
  });

  return (
    <div className="min-h-screen bg-[#FFF9F5] pb-24">
      {/* Header */}
      <header className="flex items-center px-4 py-4 gap-4 sticky top-0 bg-[#FFF9F5]/80 backdrop-blur-md z-30">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-800">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 flex-1 text-center pr-10">Payment History</h1>
      </header>

      <div className="px-5 space-y-6">
        {/* Main Tabs - Matching Image style */}
        <div className="flex bg-[#FFE5D4] p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('receive')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'receive' ? 'bg-[#FF782D] text-white shadow-lg' : 'text-[#FF782D]'}`}
          >
            Receive
          </button>
          <button 
            onClick={() => setActiveTab('purchase')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'purchase' ? 'bg-[#FF782D] text-white shadow-lg' : 'text-[#FF782D]'}`}
          >
            Purchase
          </button>
        </div>

        {/* Balance Gradient Card - Matching Image Gradient & Layout */}
        <div className="bg-gradient-to-br from-[#FF8E42] via-[#FFA825] to-[#FFD026] rounded-3xl p-6 text-white shadow-xl shadow-orange-200/50">
          <div className="grid grid-cols-2 gap-y-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/90">Balance:</p>
              <p className="text-3xl font-black italic tracking-tight">∫ {balance.toLocaleString()}</p>
            </div>
            <div className="space-y-1 text-right">
              <div className="flex justify-between items-center pl-2">
                <span className="text-xs font-medium text-white/90">Reward:</span>
                <span className="text-xl font-black italic ml-2">∫ {totalReward.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pl-2 mt-2">
                <span className="text-xs font-medium text-white/90">Pending:</span>
                <span className="text-xl font-black italic ml-2">∫ {pendingAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Tabs */}
        <div className="flex gap-12 border-b border-orange-100/50 pb-1 justify-center">
          <button 
            onClick={() => setCurrency('INR')}
            className={`font-black uppercase text-sm tracking-[0.1em] pb-3 px-4 transition-all relative ${currency === 'INR' ? 'text-[#FF782D]' : 'text-[#CCC]'}`}
          >
            INR
            {currency === 'INR' && <motion.div layoutId="cur" className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF782D] rounded-full" />}
          </button>
          <button 
            onClick={() => setCurrency('USDT')}
            className={`font-black uppercase text-sm tracking-[0.1em] pb-3 px-4 transition-all relative ${currency === 'USDT' ? 'text-[#FF782D]' : 'text-[#CCC]'}`}
          >
            USTD
            {currency === 'USDT' && <motion.div layoutId="cur" className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF782D] rounded-full" />}
          </button>
        </div>

        {/* History List - Matching Table Layout in Image */}
        <div className="space-y-4 pb-10">
          {loading ? (
             <div className="flex flex-col items-center justify-center pt-20 gap-4">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-[#FF782D] rounded-full animate-spin" />
             </div>
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={tx.id} 
                className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50/50"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <h3 className={`text-3xl font-black leading-none ${tx.type === 'withdrawal' && tx.status !== 'failed' ? 'text-red-500' : 'text-[#FF5F00]'}`}>
                      {tx.type === 'withdrawal' ? '-' : '+'} ∫ {tx.amount.toLocaleString()}
                    </h3>
                    <div className="space-y-2">
                      <p className={`text-[13px] font-bold ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-[#FF5F00]'}`}>
                        {tx.type === 'withdrawal' ? `UPI: ${tx.upiId || 'N/A'}` : `Reward: + ∫ ${tx.reward || (tx.type === 'task' ? Math.floor(tx.amount * 0.04) : 0)}`}
                      </p>
                      <p className="text-[13px] font-bold text-slate-400">
                        {tx.type === 'withdrawal' ? 'Withdrawal ID' : 'Order Code'}: <span className="text-slate-800">{tx.orderCode || tx.id.substring(0, 6).toUpperCase()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-16">
                    <div className={`
                      flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-[13px]
                      ${tx.status === 'completed' ? 'bg-[#00D084] text-white' : 
                        tx.status === 'pending' ? 'bg-[#FFB800] text-white' :
                        'bg-[#FF4D4D] text-white'}
                    `}>
                      {tx.status === 'completed' && <CheckCircle size={14} />}
                      {tx.status === 'pending' && <Clock size={14} />}
                      {tx.status === 'failed' && <XCircle size={14} />}
                      {tx.status === 'completed' ? 'Succeed' : tx.status === 'pending' ? 'Pending' : 'Failed'}
                    </div>
                    
                    <div className="text-right text-[#999] text-xs font-medium space-y-1">
                      <p>{tx.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
                      <p>{tx.createdAt?.toDate().toLocaleDateString('en-CA')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center pt-24 gap-4 opacity-40">
              <ClipboardList size={40} className="text-[#CCC]" />
              <p className="text-sm font-bold text-[#CCC] uppercase tracking-widest">No Records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

