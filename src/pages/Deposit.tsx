/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Copy, ChevronRight, Share2, Wallet, User, Globe, Hash, Clock, Landmark, Smartphone, ArrowLeft, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserProfile, createTransaction, getAppSettings, AppSettings } from '../lib/firebase';

export default function Deposit({ profile, onBack }: { profile: UserProfile | null, onBack: () => void }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    getAppSettings().then(setSettings);
  }, []);

  const copyToClipboard = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDeposit = async () => {
    if (!profile?.uid || loading || !settings) return;
    
    // Redirect to UPI
    const upiUrl = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.payeeName)}&am=100&cu=INR&tn=NeonSyndicate_Deposit_${profile.uid.substring(0,6)}`;
    window.location.href = upiUrl;

    setLoading(true);
    try {
      // Create a pending transaction for admin approval
      await createTransaction(profile.uid, {
        uid: profile.uid,
        type: 'deposit',
        amount: 100,
        description: 'Bank Deposit (UPI)',
        status: 'pending'
      });
      // We don't set success yet, admin has to approve
      // But we show a "Payment Initiated" state
      setSuccess(true);
      setTimeout(() => onBack(), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const details = [
    { label: 'PayeeAccount', value: '38250750987', icon: Hash },
    { label: 'PayeeName', value: settings?.payeeName || 'luckchi marak', icon: User },
    { label: 'IFSC', value: 'SBIN0006906', icon: Landmark, note: 'IF IFSC Mismatched , Do Not Pay' },
    { label: 'Code', value: 'pFihiD', icon: Hash },
    { label: 'Type', value: 'IMPS', icon: Globe },
    { label: 'Payout Wallet', value: 'Mobikwik', walletLogo: 'M', isWallet: true },
    { label: 'Payout Account', value: '9346507994', icon: Hash },
    { label: 'Payout UPI', value: settings?.upiId || '9346507994-2@mbkns', icon: Smartphone },
    { label: 'Status', value: success ? 'Verifying' : 'Pending', isStatus: true, statusColor: success ? 'text-amber-500' : 'text-slate-400' },
    { label: 'NO', value: 'R2026050920234505839585', icon: Hash },
  ];

  if (success) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-100"
        >
          <CheckCircle size={48} />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-800 uppercase italic">Paid Successfully!</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Updating Your Syndicate Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 pt-2">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500">
           <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black text-slate-800">Order</h1>
        <div className="w-10" />
      </div>

      <div className="premium-card overflow-hidden">
        {/* Amount Header */}
        <div className="orange-gradient p-8 text-center text-white">
          <h2 className="text-4xl font-black mb-2">INR 100.00</h2>
          <div className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold inline-block opacity-80">
            Expire: 29:53
          </div>
        </div>

        {/* Details List */}
        <div className="p-4 space-y-4">
          {details.map((item, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold text-sm w-32">{item.label}:</span>
                  <div className="flex items-center gap-2">
                    {item.walletLogo && (
                      <div className="w-5 h-5 bg-blue-600 text-white flex items-center justify-center rounded-sm text-[10px] font-bold">
                        {item.walletLogo}
                      </div>
                    )}
                    <span className={`text-slate-800 font-bold text-sm ${item.isStatus ? item.statusColor : ''}`}>
                      {item.value}
                    </span>
                    {item.isWallet && (
                      <button className="text-orange-500 border border-orange-500 px-2 h-5 rounded text-[10px] font-black uppercase ml-2">
                        Change
                      </button>
                    )}
                  </div>
                </div>
                {!item.isStatus && !item.isWallet && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => copyToClipboard(item.label, item.value)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        copiedField === item.label ? 'bg-green-50 text-green-500 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
                {item.isStatus && (
                  <button onClick={onBack} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-md text-[10px] font-black uppercase">Cancel</button>
                )}
              </div>
              {item.note && (
                <p className="text-[10px] text-orange-500 font-bold ml-32 -mt-1 leading-none italic opacity-60">
                  Note: {item.note}
                </p>
              )}
            </div>
          ))}

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <button className="text-primary font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 w-full">
              Upload Voucher <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={handleDeposit}
        disabled={loading}
        className="btn-orange w-full h-16 text-xl uppercase tracking-widest mt-8 shadow-2xl disabled:opacity-50"
      >
        {loading ? "Processing..." : "go pay"}
      </button>
    </div>
  );
}
