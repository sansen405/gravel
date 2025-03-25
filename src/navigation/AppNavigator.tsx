import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={({ navigation }) => ({
                headerRight: () => (
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Search')}
                    style={{ marginRight: 15 }}
                  >
                    <Ionicons name="search-outline" size={24} color="#000" />
                  </TouchableOpacity>
                ),
                headerLeft: () => (
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Profile')}
                    style={{ marginLeft: 15 }}
                  >
                    <Ionicons name="person-outline" size={24} color="#000" />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen 
              name="Search" 
              component={SearchScreen}
              options={({ navigation }) => ({
                headerLeft: () => (
                  <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 15 }}
                  >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={({ navigation }) => ({
                headerLeft: () => (
                  <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 15 }}
                  >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                  </TouchableOpacity>
                ),
              })}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 