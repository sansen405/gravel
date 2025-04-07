import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Travel quotes to display randomly
const TRAVEL_QUOTES = [
  '"The world is a book and those who do not travel read only one page." - Saint Augustine',
  '"Travel makes one modest. You see what a tiny place you occupy in the world." - Gustave Flaubert',
  '"Life is either a daring adventure or nothing at all." - Helen Keller',
  '"Not all those who wander are lost." - J.R.R. Tolkien',
  '"Travel far enough, you meet yourself." - David Mitchell',
];

// Mock public journals for the feed
const PUBLIC_JOURNALS = [
  {
    id: '1',
    title: 'Summer in Paris',
    city: 'Paris',
    country: 'France',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    createdAt: new Date('2024-03-10'),
    likes: 124,
    comments: 23,
    user: {
      displayName: 'Emma Wilson',
      username: 'emmaw',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    },
  },
  {
    id: '2',
    title: 'Exploring Kyoto',
    city: 'Kyoto',
    country: 'Japan',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
    createdAt: new Date('2024-02-15'),
    likes: 89,
    comments: 15,
    user: {
      displayName: 'Alex Chen',
      username: 'alexc',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    },
  },
  {
    id: '3',
    title: 'Venice Canals',
    city: 'Venice',
    country: 'Italy',
    coverImage: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0',
    createdAt: new Date('2024-02-01'),
    likes: 256,
    comments: 42,
    user: {
      displayName: 'Sofia Romano',
      username: 'sofiar',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    },
  },
  {
    id: '4',
    title: 'Marrakech Markets',
    city: 'Marrakech',
    country: 'Morocco',
    coverImage: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70',
    createdAt: new Date('2024-01-20'),
    likes: 167,
    comments: 31,
    user: {
      displayName: 'Omar Hassan',
      username: 'omarh',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    },
  },
];

// Define achievement types and their requirements
const ACHIEVEMENTS = [
  {
    id: '1',
    title: 'Globetrotter',
    description: 'Visit 3 different continents',
    icon: '🌎',
    progress: '1/3',
    isUnlocked: false,
  },
  {
    id: '2',
    title: 'Story Collector',
    description: 'Create 5 travel journals',
    icon: '📔',
    progress: '2/5',
    isUnlocked: false,
  },
  {
    id: '3',
    title: 'Mountain Conqueror',
    description: 'Visit places above 2000m altitude',
    icon: '⛰️',
    progress: '0/1',
    isUnlocked: false,
  },
  {
    id: '4',
    title: 'Island Hopper',
    description: 'Visit 5 different islands',
    icon: '🏝️',
    progress: '1/5',
    isUnlocked: false,
  },
  {
    id: '5',
    title: 'Culture Explorer',
    description: 'Visit 10 different UNESCO sites',
    icon: '🏛️',
    progress: '3/10',
    isUnlocked: false,
  },
  {
    id: '6',
    title: 'Night Owl',
    description: 'Create journals in 5 different time zones',
    icon: '🌙',
    progress: '2/5',
    isUnlocked: false,
  },
  {
    id: '7',
    title: 'Foodie',
    description: 'Document 20 local dishes in your journals',
    icon: '🍜',
    progress: '8/20',
    isUnlocked: false,
  },
  {
    id: '8',
    title: 'Adventurer',
    description: 'Try 5 extreme sports while traveling',
    icon: '🏄‍♂️',
    progress: '1/5',
    isUnlocked: false,
  },
  {
    id: '9',
    title: 'Polyglot',
    description: 'Visit countries with 5 different languages',
    icon: '🗣️',
    progress: '2/5',
    isUnlocked: false,
  },
  {
    id: '10',
    title: 'Festival Seeker',
    description: 'Attend 3 cultural festivals',
    icon: '🎭',
    progress: '1/3',
    isUnlocked: false,
  },
  {
    id: '11',
    title: 'Nature Lover',
    description: 'Visit 5 national parks',
    icon: '🌲',
    progress: '2/5',
    isUnlocked: false,
  },
  {
    id: '12',
    title: 'Urban Explorer',
    description: 'Visit 10 capital cities',
    icon: '🌆',
    progress: '4/10',
    isUnlocked: false,
  }
];

interface Journal {
  id: string;
  title: string;
  description: string;
  date: string;
  images: string[];
  username: string;
}

const HomeScreen = ({ navigation }) => {
  const [journals, setJournals] = useState<Journal[]>([]);

  const loadJournals = async () => {
    try {
      const savedJournals = await AsyncStorage.getItem('journals');
      if (savedJournals) {
        setJournals(JSON.parse(savedJournals));
      }
    } catch (error) {
      console.error('Error loading journals:', error);
    }
  };

  // Refresh journals when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadJournals();
    }, [])
  );

  const randomQuote = TRAVEL_QUOTES[Math.floor(Math.random() * TRAVEL_QUOTES.length)];

  const renderJournal = ({ item }) => (
    <TouchableOpacity
      style={styles.journalCard}
      onPress={() => navigation.navigate('JournalDetail', { 
        journal: item,
        isFromProfile: false
      })}
    >
      {(item.images?.[0] || item.items?.find(i => i.type === 'photo')?.content) && (
        <Image
          source={{ 
            uri: item.images?.[0] || item.items?.find(i => i.type === 'photo')?.content 
          }}
          style={styles.journalImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.journalContent}>
        <Text style={styles.journalTitle}>{item.title}</Text>
        <Text style={styles.journalDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={styles.imagesCount}>
          {(item.images?.length || item.items?.filter(i => i.type === 'photo').length || 0)} photos
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderAchievement = ({ item }) => (
    <TouchableOpacity style={styles.achievementCard}>
      <Text style={styles.achievementIcon}>{item.icon}</Text>
      <Text style={styles.achievementTitle}>{item.title}</Text>
      <Text style={styles.achievementDescription}>{item.description}</Text>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(parseInt(item.progress.split('/')[0]) / parseInt(item.progress.split('/')[1])) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>{item.progress}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gravel</Text>
      </View>
      <FlatList
        data={journals}
        renderItem={renderJournal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.journalsList}
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
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  journalsList: {
    padding: 15,
  },
  journalCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  journalImage: {
    width: '100%',
    height: 200, // Fixed height for the preview image
    backgroundColor: '#222222', // Placeholder color
  },
  journalContent: {
    padding: 15,
  },
  journalTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  journalDate: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  imagesCount: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter_400Regular',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1e1e1e',
  },
  navButton: {
    padding: 8,
  },
  quoteContainer: {
    padding: 20,
    backgroundColor: '#1e1e1e',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  quote: {
    fontSize: 16,
    color: '#e0e0e0',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  achievementsSection: {
    padding: 20,
    backgroundColor: '#1e1e1e',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  achievementsList: {
    paddingRight: 20,
  },
  achievementCard: {
    width: 150,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#404040',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
  },
});

export default HomeScreen; 