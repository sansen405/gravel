import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface User {
  id: string;
  username: string;
  displayName: string;
  profileImage?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Clear any existing user data on app launch
        await AsyncStorage.removeItem('user');
        setUser(null);
      } catch (error) {
        console.error('Error clearing user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async () => {
    try {
      // Check if we already have a dev user stored
      const existingDevUser = await AsyncStorage.getItem('devUser');
      
      if (existingDevUser) {
        // If we have an existing dev user, use that
        const devUser = JSON.parse(existingDevUser);
        await AsyncStorage.setItem('user', JSON.stringify(devUser));
        setUser(devUser);
      } else {
        // If no existing dev user, create a new one
        const newDevUser = {
          id: 'dev-123',
          username: 'developer',
          displayName: 'Developer Mode',
          bio: 'Testing the app',
          profileImage: null,
        };
        // Store it both as current user and save it as dev user
        await AsyncStorage.setItem('devUser', JSON.stringify(newDevUser));
        await AsyncStorage.setItem('user', JSON.stringify(newDevUser));
        setUser(newDevUser);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = async () => {
    try {
      // Only remove the current user, keep the dev user data
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...data };
      // Update both current user and dev user
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      await AsyncStorage.setItem('devUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 