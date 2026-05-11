import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp,
  collectionGroup
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

/**
 * Internal helper to map a phone number to a secure Firebase Auth "email"
 * This allows us to use standard Auth features with phone numbers.
 */
export const getInternalEmail = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `${cleanPhone}@neonwallet.mobile`;
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Profile Helpers
export interface UserProfile {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  identityId: string;
  vipLevel: number;
  referralCode: string;
  createdAt: any;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, path);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function createUserProfile(profile: Partial<UserProfile>): Promise<void> {
  if (!profile.uid) return;
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, path), {
      ...profile,
      balance: profile.balance ?? 0,
      totalDeposits: profile.totalDeposits ?? 0,
      totalWithdrawals: profile.totalWithdrawals ?? 0,
      vipLevel: profile.vipLevel ?? 1,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Transaction Helpers
export interface Transaction {
  id: string;
  uid: string;
  type: 'deposit' | 'withdrawal' | 'task' | 'referral';
  amount: number;
  reward?: number; // Added: tracks commission for tasks
  orderCode?: string; // Added: tracks order IDs
  upiId?: string; // Added: tracks withdrawal target UPI
  screenshotUrl?: string; // Added: tracks payment proof screenshot
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: any;
}

export async function createTransaction(uid: string, tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> {
  const collectionPath = `users/${uid}/transactions`;
  try {
    const newDocRef = doc(collection(db, collectionPath));
    await setDoc(newDocRef, {
      ...tx,
      createdAt: serverTimestamp(),
    });
    
    // Update user stats (atomic update)
    const userRef = doc(db, `users/${uid}`);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      const updates: any = {};
      
      if (tx.status === 'completed') {
        const currentBalance = userData.balance ?? 0;
        if (tx.type === 'deposit') {
          updates.balance = currentBalance + tx.amount;
          updates.totalDeposits = (userData.totalDeposits ?? 0) + tx.amount;
        } else if (tx.type === 'withdrawal') {
          // If already deducted on pending creation, don't deduct again
          // updates.balance = currentBalance - tx.amount;
          updates.totalWithdrawals = (userData.totalWithdrawals ?? 0) + tx.amount;
        } else if (tx.type === 'task' || tx.type === 'referral') {
          updates.balance = currentBalance + tx.amount;
        }
      } else if (tx.status === 'pending' && tx.type === 'withdrawal') {
        // Deduct balance immediately for withdrawal requests
        const currentBalance = userData.balance ?? 0;
        updates.balance = currentBalance - tx.amount;
      }
      
      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}

export function subscribeToTransactions(uid: string, callback: (txs: Transaction[]) => void) {
  const path = `users/${uid}/transactions`;
  const q = query(collection(db, path));
  return onSnapshot(q, (snapshot) => {
    const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    txs.sort((a, b) => {
      const dateA = a.createdAt?.toDate() || new Date(0);
      const dateB = b.createdAt?.toDate() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    callback(txs);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export interface AppSettings {
  upiId: string;
  payeeName: string;
}

export async function getAppSettings(): Promise<AppSettings> {
  const path = 'settings/global';
  try {
    const docSnap = await getDoc(doc(db, path));
    if (docSnap.exists()) {
      return docSnap.data() as AppSettings;
    }
    return { upiId: '9346507994-2@mbkns', payeeName: 'luckchi marak' };
  } catch (error) {
    return { upiId: '9346507994-2@mbkns', payeeName: 'luckchi marak' };
  }
}

export async function updateAppSettings(settings: AppSettings): Promise<void> {
  const path = 'settings/global';
  try {
    await setDoc(doc(db, path), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Admin Helpers
export async function getAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const q = query(collection(db, path));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function getPendingTransactions(): Promise<Transaction[]> {
  try {
    const q = query(collectionGroup(db, 'transactions'), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'transactions-group');
    return [];
  }
}

export async function updateTransactionStatus(uid: string, txId: string, status: 'completed' | 'failed'): Promise<void> {
  const txPath = `users/${uid}/transactions/${txId}`;
  try {
    const txRef = doc(db, txPath);
    const txSnap = await getDoc(txRef);
    if (!txSnap.exists()) return;

    const txData = txSnap.data() as Transaction;
    if (txData.status === status) return; // No change

    // If changing to completed, update user balance
    if (status === 'completed' && txData.status !== 'completed') {
      const userRef = doc(db, `users/${uid}`);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        const updates: any = {};
        
        if (txData.type === 'deposit') {
          updates.balance = (userData.balance || 0) + txData.amount;
          updates.totalDeposits = (userData.totalDeposits || 0) + txData.amount;
        } else if (txData.type === 'withdrawal') {
          // Balance was already deducted on request creation (pending)
          updates.totalWithdrawals = (userData.totalWithdrawals || 0) + txData.amount;
        } else if (txData.type === 'task' || txData.type === 'referral') {
          updates.balance = (userData.balance || 0) + txData.amount;
        }
        
        if (Object.keys(updates).length > 0) {
           await updateDoc(userRef, updates);
        }
      }
    } else if (status === 'failed' && txData.status === 'pending') {
      // If a pending withdrawal fails, refund the balance
      if (txData.type === 'withdrawal') {
        const userRef = doc(db, `users/${uid}`);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data() as UserProfile;
          await updateDoc(userRef, {
            balance: (userData.balance || 0) + txData.amount
          });
        }
      }
    }

    await updateDoc(txRef, { status, updatedAt: serverTimestamp() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, txPath);
  }
}

export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  const path = `users/${uid}`;
  const docRef = doc(db, path);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as UserProfile);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}
