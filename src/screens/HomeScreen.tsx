import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

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

export default function HomeScreen() {
  const navigation = useNavigation();
  const randomQuote = TRAVEL_QUOTES[Math.floor(Math.random() * TRAVEL_QUOTES.length)];

  const renderJournalCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('JournalDetail', { journalId: item.id })}
    >
      <Image
        source={{ uri: item.coverImage }}
        style={styles.coverImage}
      />
      
      <View style={styles.cardContent}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.user.profileImage }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.displayName}>{item.user.displayName}</Text>
            <Text style={styles.username}>@{item.user.username}</Text>
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.location}>{item.city}, {item.country}</Text>
        
        <View style={styles.stats}>
          <Text style={styles.date}>
            {item.createdAt.toLocaleDateString()}
          </Text>
          <View style={styles.engagement}>
            <Text style={styles.stat}>♥ {item.likes}</Text>
            <Text style={styles.stat}>💬 {item.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.quoteContainer}>
        <Text style={styles.quote}>{randomQuote}</Text>
      </View>

      <FlatList
        data={PUBLIC_JOURNALS}
        renderItem={renderJournalCard}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  quoteContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  quote: {
    fontSize: 16,
    color: '#4b5563',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    width: width - 32,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  username: {
    fontSize: 14,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
  },
  engagement: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    fontSize: 14,
    color: '#6b7280',
  },
}); 