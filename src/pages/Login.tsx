/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, LogIn, ShieldCheck, UserPlus, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { 
  auth, 
  getInternalEmail, 
  createUserProfile 
} from '../lib/firebase';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    referralCode: ''
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError(null);

    const { phone, password, name, referralCode } = formData;

    if (!phone || !password || (isSignUp && !name)) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (phone.length < 10) {
      setError("Please enter a valid phone number.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const email = getInternalEmail(phone);

      if (isSignUp) {
        // Create Authentication account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Set display name in Auth
        await updateProfile(user, { displayName: name });

        // Create initial Firestore Profile
        await createUserProfile({
          uid: user.uid,
          name: name,
          email: "", 
          phone: phone,
          balance: 0,
          identityId: `NW-${Math.floor(Math.random() * 1000000)}`,
          vipLevel: 1,
          referralCode: referralCode || "NEW-USER"
        });

        // Add Welcome Bonus Transaction
        const { createTransaction } = await import('../lib/firebase');
        await createTransaction(user.uid, {
          uid: user.uid,
          type: 'task',
          amount: 155,
          description: 'Newcomer Registration Bonus',
          status: 'completed'
        });
      } else {
        // Sign In
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
          if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            throw new Error(`Profile not found for ${phone}. Click "New Affiliate? Sign Up" below if you haven't registered yet.`);
          } else if (err.code === 'auth/wrong-password') {
            throw new Error("Incorrect password for this node. Access denied.");
          }
          throw err;
        }
      }
    } catch (err: any) {
      console.error("Auth failed", err);
      
      const errorCode = err.code;
      if (errorCode === 'auth/operation-not-allowed') {
        setError("Sign-in with Email/Password is not enabled in your Firebase project. Please go to the Firebase Console -> Authentication -> Sign-in method and enable 'Email/Password'.");
      } else if (errorCode === 'auth/email-already-in-use') {
        setError("An account with this phone number already exists. Please login instead.");
      } else if (errorCode === 'auth/weak-password') {
        setError("The password provided is too weak.");
      } else if (errorCode === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-cyan-500/5">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">NeonWallet</h1>
            <p className="text-slate-400 mt-2 text-center text-sm font-medium">
              {isSignUp ? "Create your elite account" : "Enter the futuristic ecosystem"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserPlus className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-12 bg-slate-800/30 border border-slate-700/50 text-white rounded-2xl py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder:text-slate-600 text-sm font-medium"
                  required={isSignUp}
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full pl-12 bg-slate-800/30 border border-slate-700/50 text-white rounded-2xl py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder:text-slate-600 text-sm font-medium"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-12 pr-12 bg-slate-800/30 border border-slate-700/50 text-white rounded-2xl py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder:text-slate-600 text-sm font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
                id="toggle-pass-visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {isSignUp && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  name="referralCode"
                  placeholder="Referral Code (Optional)"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="block w-full pl-12 bg-slate-800/30 border border-slate-700/50 text-white rounded-2xl py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder:text-slate-600 text-sm font-medium"
                />
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold leading-tight"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black uppercase text-sm tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 active:scale-95 group"
              id="auth-action-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Sign Up Protocol" : "Secure Login"}
                  {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-4">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              id="toggle-auth-mode"
            >
              <div className="w-1 h-1 bg-cyan-400 rounded-full" />
              {isSignUp ? "Existing Identity? Login" : "New Affiliate? Sign Up"}
              <div className="w-1 h-1 bg-cyan-400 rounded-full" />
            </button>
            <p className="text-slate-600 text-[10px] text-center font-bold uppercase tracking-tighter opacity-60">
              Access granted to authorized personnel only.
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-40">
          <span className="flex items-center gap-2"><ShieldCheck size={14} /> Encrypted Node</span>
          <span className="flex items-center gap-2"><Lock size={14} /> Secure Protocol</span>
        </div>
      </motion.div>
    </div>
  );
}


