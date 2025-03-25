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
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, setDevUser } = useAuth();

  const handleLogin = async () => {
    try {
      // Developer mode check
      if (password === 'dev') {
        setDevUser({
          id: 'dev-user',
          email: email || 'dev@example.com',
          username: 'developer',
          displayName: 'Developer',
        });
        return;
      }

      await login(email, password);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Design */}
      <View style={styles.backgroundArt}>
        {/* Sun */}
        <View style={styles.sun} />
        
        {/* Mountains - using triangles */}
        <View style={[styles.triangle, styles.mountain1]} />
        <View style={[styles.triangle, styles.mountain2]} />
        <View style={[styles.triangle, styles.mountain3]} />
        <View style={[styles.triangle, styles.mountain4]} />
        <View style={[styles.triangle, styles.mountain5]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <View style={styles.form}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

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

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b', // Deep indigo base
    // Adding a linear gradient effect through layered views would be even better,
    // but since we want to keep it simple, we'll use a solid evening color
  },
  backgroundArt: {
    ...StyleSheet.absoluteFillObject,
  },
  sun: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fbbf24', // Warm yellow
    top: '15%',
    right: '10%',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  triangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: width,
    borderRightWidth: width,
    borderBottomWidth: height * 0.6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  mountain1: {
    borderBottomColor: '#4c1d95',
    transform: [{ scale: 1.2 }],
    bottom: -height * 0.2,
    left: -width * 0.9,
  },
  mountain2: {
    borderBottomColor: '#5b21b6',
    transform: [
      { scale: 1.0 },
      { rotate: '-5deg' },
    ],
    bottom: -height * 0.15,
    left: -width * 0.4,
  },
  mountain3: {
    borderBottomColor: '#6d28d9',
    transform: [
      { scale: 1.3 },
      { rotate: '2deg' },
    ],
    bottom: -height * 0.25,
    left: width * 0.1,
  },
  mountain4: {
    borderBottomColor: '#7c3aed',
    transform: [
      { scale: 1.1 },
      { rotate: '-3deg' },
    ],
    bottom: -height * 0.18,
    left: -width * 0.2,
  },
  mountain5: {
    borderBottomColor: '#8b5cf6',
    transform: [
      { scale: 0.9 },
      { rotate: '4deg' },
    ],
    bottom: -height * 0.12,
    left: width * 0.3,
  },
  // Add snow caps
  mountainSnow1: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: width * 0.15,
    borderRightWidth: width * 0.15,
    borderBottomWidth: height * 0.15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ rotate: '180deg' }],
    top: '25%',
    left: -width * 0.15,
  },
  // Add gradient overlay for depth
  mountainShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.7,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    opacity: 0.3,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)', // Dark transparent background
    borderRadius: 20,
    padding: 20,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)', // Subtle border
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f1f5f9', // Light gray
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8', // Muted gray
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)', // Very dark blue
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    color: '#f1f5f9',
  },
  loginButton: {
    backgroundColor: '#8b5cf6', // Purple
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  registerLink: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
}); 