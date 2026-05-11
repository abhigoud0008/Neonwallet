/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, Wallet, BarChart3, User, CircleDollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'payment', label: 'Payment', icon: Wallet },
  { id: 'rewards', label: 'Central', icon: CircleDollarSign, isSpecial: true },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'my', label: 'My', icon: User },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 px-2 pb-6 pt-2">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative -top-6 flex flex-col items-center group"
              >
                <div className="w-16 h-16 rounded-full orange-gradient flex items-center justify-center shadow-lg shadow-orange-200 border-4 border-white">
                  <Icon size={32} className="text-white" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
