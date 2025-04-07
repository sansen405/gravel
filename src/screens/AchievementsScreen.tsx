import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const ACHIEVEMENTS = [
  {
    id: '1',
    title: 'Wanderlust',
    description: 'Visit your first destination',
    icon: 'airplane-outline',
  },
  {
    id: '2',
    title: 'Road Warrior',
    description: 'Complete 5 road trips',
    icon: 'car-outline',
  },
  {
    id: '3',
    title: 'Mountain Explorer',
    description: 'Hike 3 different trails',
    icon: 'trail-sign-outline',
  },
  {
    id: '4',
    title: 'City Slicker',
    description: 'Visit 10 different cities',
    icon: 'business-outline',
  },
  {
    id: '5',
    title: 'Photographer',
    description: 'Share 20 travel photos',
    icon: 'camera-outline',
  },
];

const AchievementsScreen = () => {
  const renderAchievement = ({ item }) => (
    <View style={styles.achievementCard}>
      <View style={styles.achievementHeader}>
        <Ionicons name={item.icon} size={24} color="#FFFFFF" />
        <Text style={styles.achievementTitle}>{item.title}</Text>
      </View>
      <Text style={styles.achievementDescription}>{item.description}</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: '0%' }]} />
      </View>
      <Text style={styles.progressText}>0%</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
      </View>
      <FlatList
        data={ACHIEVEMENTS}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.achievementsList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  achievementsList: {
    padding: 15,
  },
  achievementCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  achievementDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#888888',
    marginBottom: 12,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#888888',
  },
});

export default AchievementsScreen; 
export default AchievementsScreen; 