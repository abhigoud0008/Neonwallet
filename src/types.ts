/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'reward' | 'referral';
  amount: number;
  status: 'success' | 'pending' | 'failed' | 'Completed';
  date: string;
  description: string;
}

export interface RewardPackage {
  id: string;
  name: string;
  price: number;
  dailyReward: number;
  durationDays: number;
  totalReturn: number;
  category: 'Mini' | 'Standard' | 'Pro' | 'Elite' | 'VIP';
  color: string;
}

export interface User {
  id: string;
  phone: string;
  balance: number;
  totalRewards: number;
  referralCode: string;
  vipLevel: number;
  joinedAt: string;
}
