import "./firebase";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, getUserProfile, createUserProfile, createTransaction, UserProfile } from './lib/firebase';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Payment from './pages/Payment';
import Team from './pages/Team';
import Statistics from './pages/Statistics';
import PaymentHistory from './pages/PaymentHistory';
import Admin from './pages/Admin';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import { subscribeToUserProfile } from './lib/firebase';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        // First check if profile exists
        const existingProfile = await getUserProfile(firebaseUser.uid);
        
        if (!existingProfile) {
          const newProfile: Partial<UserProfile> = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Syndicate Member',
            email: firebaseUser.email || undefined,
            balance: 0, // Start with 0 and add via transaction
            identityId: Math.floor(100000 + Math.random() * 900000).toString(),
            vipLevel: 1,
            referralCode: "NEON-" + Math.random().toString(36).substring(7).toUpperCase()
          };
          await createUserProfile(newProfile);
          
          // Add Welcome Bonus Transaction
          await createTransaction(firebaseUser.uid, {
            uid: firebaseUser.uid,
            type: 'task', // Or a new 'bonus' type if we want, but 'task' works for income
            amount: 155,
            description: 'Newcomer Registration Bonus',
            status: 'completed'
          });
        }

        // Subscribe to real-time updates
        unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, (p) => setProfile(p));
      } else {
        setProfile(null);
      }
      
      // Ensure splash shows for at least a beat, but don't block auth state unnecessarily
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const renderPage = () => {
    if (showHistory) return <PaymentHistory onBack={() => setShowHistory(false)} profile={profile} />;
    
    switch (activeTab) {
      case 'home': return <Dashboard onShowHistory={() => setShowHistory(true)} onTabChange={(tab) => setActiveTab(tab)} profile={profile} />;
      case 'payment': return <Payment profile={profile} />;
      case 'rewards': return <Dashboard onShowHistory={() => setShowHistory(true)} onTabChange={(tab) => setActiveTab(tab)} profile={profile} />;
      case 'statistics': return <Statistics profile={profile} />;
      case 'my': return <Team profile={profile} onShowAdmin={() => setActiveTab('admin')} />;
      case 'deposit': return <Deposit profile={profile} onBack={() => setActiveTab('home')} />;
      case 'withdraw': return <Withdraw profile={profile} onBack={() => setActiveTab('home')} />;
      case 'admin': return <Admin onBack={() => setActiveTab('my')} />;
      default: return <Dashboard onShowHistory={() => setShowHistory(true)} onTabChange={(tab) => setActiveTab(tab)} profile={profile} />;
    }
  };

  const isCurrentPageAdmin = activeTab === 'admin';

  return (
    <div className="min-h-screen bg-app-bg text-slate-800 selection:bg-orange-500/10 selection:text-orange-600">
      <AnimatePresence mode="wait">
        {loading ? (
          <Splash key="splash" />
        ) : !user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Login />
          </motion.div>
        ) : (
          <div key="main-app" className="relative max-w-lg mx-auto min-h-screen">
            {!showHistory && !isCurrentPageAdmin && <Header profile={profile} />}
            
            <main className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab + (showHistory ? 'history' : '')}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {renderPage()}
                </motion.div>
              </AnimatePresence>
            </main>

            {!isCurrentPageAdmin && !showHistory && (
              <BottomNav 
                activeTab={activeTab} 
                onTabChange={(tab) => setActiveTab(tab)} 
              />
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


