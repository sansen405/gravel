import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, username: string, displayName: string) => Promise<User>;
  logout: () => Promise<void>;
  setDevUser: (email: string) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  register: async () => null,
  logout: async () => {},
  setDevUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUser(user);
          } else {
            // If user exists in Auth but not in Firestore, sign them out
            await auth.signOut();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const setDevUser = (email: string) => {
    const devUser = {
      uid: 'dev-user',
      email: email || 'dev@example.com',
      displayName: 'Developer',
    } as User;
    setUser(devUser);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string, displayName: string) => {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username,
        displayName,
        email,
        createdAt: new Date(),
        followers: [],
        following: [],
      });

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    register,
    logout,
    setDevUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 