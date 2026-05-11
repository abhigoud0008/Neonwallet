/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Wallet } from 'lucide-react';

export default function Splash() {
  return (
    <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-100 rounded-full blur-[100px] opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-40" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <div className="w-32 h-32 orange-gradient rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-orange-200">
          <Wallet size={64} className="text-white" />
        </div>
        
        <div className="text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-5xl font-black text-slate-800 tracking-tighter"
          >
            NeonWallet
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs mt-3 ml-1"
          >
            Light Edition
          </motion.p>
        </div>
      </motion.div>

      {/* Loading Bar */}
      <motion.div 
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden"
      >
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="h-full orange-gradient rounded-full"
        />
      </motion.div>

      <p className="absolute bottom-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Verifying Secure Protocol...
      </p>
    </div>
  );
}
