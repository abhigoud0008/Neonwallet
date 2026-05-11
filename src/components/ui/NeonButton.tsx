/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import React from 'react';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function NeonButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  disabled = false,
}: NeonButtonProps) {
  const baseStyles = 'relative flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95';
  
  const variants = {
    primary: 'bg-gradient-to-r from-neon-purple to-neon-cyan text-white shadow-[0_0_20px_rgba(157,0,255,0.4)]',
    secondary: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10',
    outline: 'bg-transparent border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 shadow-[0_0_15px_rgba(0,243,255,0.2)]',
    ghost: 'bg-transparent text-white hover:bg-white/5',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
      )}
    </motion.button>
  );
}
