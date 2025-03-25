import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const { register } = useAuth();

  const validateInputs = () => {
    if (!email || !password || !confirmPassword || !username || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert('Error', 'Username can only contain letters, numbers, and underscores');
      return false;
    }

    return true;
  };

  const checkUsernameAvailability = async (username: string) => {
    try {
      const usersRef = query(db, 'users', where('username', '==', username));
      const querySnapshot = await getDocs(usersRef);
      return querySnapshot.empty;
    } catch (error) {
      console.error('Username check error:', error);
      return false; // If there's an error checking username, assume it's taken
    }
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);

      await register(email, password, username, displayName);

      // Show success message and navigate to Home
      Alert.alert(
        'Success',
        'Account created successfully! Welcome to Travel Journal.',
        [
          {
            text: 'OK',
            onPress: () => {
              // The AuthContext will automatically handle the navigation
              // when it detects the new user state
            }
          }
        ]
      );
    } catch (error: any) {
      console.log('Registration error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'An error occurred during registration';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please try again later';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled';
            break;
          case 'permission-denied':
            errorMessage = 'Permission denied. Please try again';
            break;
          default:
            errorMessage = `Error: ${error.message || error.code}`;
        }
      }
      
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Design */}
      <View style={styles.backgroundArt}>
        {/* Moon */}
        <View style={styles.moon}>
          <View style={styles.moonCrater1} />
          <View style={styles.moonCrater2} />
          <View style={styles.moonCrater3} />
        </View>

        {/* Hills */}
        <View style={[styles.hill, styles.hill1]} />
        <View style={[styles.hill, styles.hill2]} />
        <View style={[styles.hill, styles.hill3]} />

        {/* Trees */}
        {/* Background Trees (higher up) */}
        <Tree left={width * 0.05} bottom={height * 0.22} scale={0.35} color="#1a2f25" />
        <Tree left={width * 0.15} bottom={height * 0.25} scale={0.3} color="#2d5a40" />
        <Tree left={width * 0.28} bottom={height * 0.2} scale={0.4} color="#233b2e" />
        <Tree left={width * 0.42} bottom={height * 0.23} scale={0.32} color="#1e3a2b" />
        <Tree left={width * 0.55} bottom={height * 0.21} scale={0.38} color="#345c46" />
        <Tree left={width * 0.68} bottom={height * 0.24} scale={0.35} color="#284936" />
        <Tree left={width * 0.82} bottom={height * 0.22} scale={0.33} color="#1f2f27" />
        <Tree left={width * 0.95} bottom={height * 0.25} scale={0.36} color="#2a4535" />

        {/* Mid-ground Trees */}
        <Tree left={width * -0.02} bottom={height * 0.1} scale={0.85} color="#2d5a40" />
        <Tree left={width * 0.12} bottom={height * 0.08} scale={0.9} color="#1e3a2b" />
        <Tree left={width * 0.25} bottom={height * 0.12} scale={0.8} color="#3b6b4f" />
        <Tree left={width * 0.38} bottom={height * 0.09} scale={0.95} color="#2c4e3d" />
        <Tree left={width * 0.52} bottom={height * 0.11} scale={0.87} color="#254631" />
        <Tree left={width * 0.65} bottom={height * 0.08} scale={0.92} color="#326244" />
        <Tree left={width * 0.78} bottom={height * 0.1} scale={0.88} color="#1d332a" />
        <Tree left={width * 0.92} bottom={height * 0.09} scale={0.83} color="#2f5842" />

        {/* Foreground Trees (at bottom and below) */}
        <Tree left={width * -0.05} bottom={-30} scale={1.5} color="#2a4535" />
        <Tree left={width * 0.08} bottom={-20} scale={1.6} color="#3b6b4f" />
        <Tree left={width * 0.22} bottom={-25} scale={1.45} color="#1e3a2b" />
        <Tree left={width * 0.35} bottom={-15} scale={1.55} color="#345c46" />
        <Tree left={width * 0.48} bottom={-28} scale={1.58} color="#2d5a40" />
        <Tree left={width * 0.62} bottom={-18} scale={1.52} color="#284936" />
        <Tree left={width * 0.75} bottom={-22} scale={1.48} color="#326244" />
        <Tree left={width * 0.88} bottom={-25} scale={1.54} color="#233b2e" />
        <Tree left={width * 1.02} bottom={-20} scale={1.5} color="#2f5842" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <View style={styles.form}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your journey</Text>

          <TextInput
            style={styles.input}
            placeholder="Display Name"
            placeholderTextColor="#9ca3af"
            value={displayName}
            onChangeText={setDisplayName}
          />

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#9ca3af"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Tree component
const Tree = ({ left, bottom, scale, color }) => (
  <View style={[styles.tree, { left, bottom, transform: [{ scale }] }]}>
    <View style={[styles.treeTop, { borderBottomColor: color }]} />
    <View style={[styles.treeTop2, { borderBottomColor: color }]} />
    <View style={[styles.treeTrunk, { backgroundColor: color }]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark blue background
  },
  backgroundArt: {
    ...StyleSheet.absoluteFillObject,
  },
  moon: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    top: '10%',
    right: '10%',
    shadowColor: '#f3f4f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  moonCrater1: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    top: '20%',
    left: '30%',
  },
  moonCrater2: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#e5e7eb',
    top: '50%',
    left: '60%',
  },
  moonCrater3: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e5e7eb',
    top: '30%',
    left: '70%',
  },
  tree: {
    position: 'absolute',
    alignItems: 'center',
  },
  treeTop: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 50,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -10,
  },
  treeTop2: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 40,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -5,
  },
  treeTrunk: {
    width: 10,
    height: 20,
    backgroundColor: '#4b5563',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 20,
    padding: 20,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    color: '#f1f5f9',
  },
  registerButton: {
    backgroundColor: '#2d5a40', // Forest green
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  loginLink: {
    color: '#2d5a40',
    fontSize: 14,
    fontWeight: '600',
  },
  hill: {
    position: 'absolute',
    width: width * 2,
    height: height * 0.8,
    borderRadius: height * 0.4,
    transform: [{ scaleX: 2 }], // Makes the hills wider
  },
  hill1: {
    backgroundColor: '#0f2417', // Darkest hill
    bottom: -height * 0.5,
    left: -width * 0.5,
  },
  hill2: {
    backgroundColor: '#152e1e', // Medium dark hill
    bottom: -height * 0.55,
    left: -width * 0.8,
  },
  hill3: {
    backgroundColor: '#1a3825', // Lightest hill
    bottom: -height * 0.6,
    left: -width * 0.3,
  },
}); 