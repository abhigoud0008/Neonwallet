/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function GlassCard({ children, className = '', hoverEffect = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hoverEffect ? { scale: 1.02, translateY: -5 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`glass-card p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
