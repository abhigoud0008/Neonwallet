/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { TrendingUp, PieChart, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { UserProfile } from '../lib/firebase';

export default function Statistics({ profile }: { profile: UserProfile | null }) {
  const balance = profile?.balance || 12850;
  return (
    <div className="pb-32 px-4 pt-2 space-y-6">
      <h1 className="text-3xl font-black text-center text-slate-800">Statistics</h1>

      {/* Portfolio Card */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-60" />
        <div className="relative z-10">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Total Portfolio</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl font-black italic text-slate-800">∫ {balance.toLocaleString()}</h2>
            <span className="text-green-500 font-black text-sm flex items-center bg-green-50 px-2 py-0.5 rounded-full">
              <TrendingUp size={14} className="mr-1" /> +12%
            </span>
          </div>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Weekly Gain', value: '+ ∫ 450', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Asset Split', value: '4 Assets', icon: PieChart, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-5 border border-slate-50 shadow-sm">
            <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-black italic text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Growth Chart Simulation */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800">Growth Analysis</h3>
          <select className="bg-slate-50 border-none text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full outline-none text-slate-500">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        
        <div className="h-48 flex items-end justify-between gap-1">
          {[40, 70, 45, 90, 65, 80, 55, 75, 50, 85].map((h, i) => (
            <motion.div 
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.05, duration: 1 }}
              className={`w-full rounded-t-lg transition-colors group relative ${
                i === 3 ? 'orange-gradient' : 'bg-slate-100 hover:bg-orange-200'
              }`}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {h * 10}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Asset Distribution */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">Asset Distribution</h3>
        <div className="space-y-3">
          {[
            { name: 'USDT Staking', value: '∫ 8,500', change: '+2.4%', icon: ArrowUpRight, color: 'text-green-500' },
            { name: 'Vortex Node', value: '∫ 3,200', change: '+5.1%', icon: ArrowUpRight, color: 'text-green-500' },
            { name: 'Core Rewards', value: '∫ 1,150', change: '-0.8%', icon: ArrowDownRight, color: 'text-red-500' },
          ].map((asset, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-50 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center ${asset.color}`}>
                  <asset.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{asset.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{asset.change} past 24h</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black italic text-slate-800">{asset.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
