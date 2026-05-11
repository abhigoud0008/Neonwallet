/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RewardPackage, Transaction } from './types';

export const REWARD_PACKAGES: RewardPackage[] = [
  {
    id: 'pkg-1',
    name: 'Mini Node',
    price: 100,
    dailyReward: 4,
    totalReturn: 180,
    durationDays: 45,
    category: 'Mini',
    color: 'from-orange-400 to-orange-600',
  },
  {
    id: 'pkg-2',
    name: 'Standard Cycle',
    price: 400,
    dailyReward: 16,
    totalReturn: 720,
    durationDays: 45,
    category: 'Standard',
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'pkg-3',
    name: 'Pro Harvest',
    price: 1328,
    dailyReward: 53.12,
    totalReturn: 2390,
    durationDays: 45,
    category: 'Pro',
    color: 'from-cyan-400 to-cyan-600',
  },
];

export const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'deposit',
    amount: 100,
    description: 'Deposit INR',
    date: '2026-05-09 20:23',
    status: 'pending',
  },
  {
    id: 'tx-2',
    type: 'reward',
    amount: 4,
    description: 'Claim Reward',
    date: '2026-05-09 18:45',
    status: 'success',
  },
];
