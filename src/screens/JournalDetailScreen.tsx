import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Using the same mock data from HomeScreen
const MOCK_JOURNALS = [
  {
    id: '1',
    title: 'Summer in Paris',
    city: 'Paris',
    country: 'France',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    createdAt: new Date('2024-03-10'),
    likes: 124,
    comments: 23,
    description: 'Exploring the beautiful streets of Paris, visiting iconic landmarks, and enjoying delicious French cuisine.',
    memories: [
      'Visited the Eiffel Tower at sunset',
      'Had coffee at a charming café in Montmartre',
      'Explored the Louvre Museum',
      'Walked along the Seine River'
    ],
    user: {
      displayName: 'Emma Wilson',
      username: 'emmaw',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    },
  },
  // ... other mock journals
];

export default function JournalDetailScreen() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnim] = useState(new Animated.Value(0));
  const route = useRoute();
  const { journalId } = route.params;
  
  const journal = MOCK_JOURNALS.find(j => j.id === journalId);

  const flipCard = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  if (!journal) {
    return (
      <View style={styles.container}>
        <Text>Journal not found</Text>
      </View>
    );
  }

  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={flipCard} activeOpacity={1}>
        <Animated.View style={[styles.card, frontAnimatedStyle]}>
          <Image
            source={{ uri: journal.coverImage }}
            style={styles.coverImage}
          />
        </Animated.View>

        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <View style={styles.content}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: journal.user.profileImage }}
                style={styles.profileImage}
              />
              <View>
                <Text style={styles.displayName}>{journal.user.displayName}</Text>
                <Text style={styles.username}>@{journal.user.username}</Text>
              </View>
            </View>

            <Text style={styles.title}>{journal.title}</Text>
            <Text style={styles.location}>{journal.city}, {journal.country}</Text>
            <Text style={styles.date}>
              {journal.createdAt.toLocaleDateString()}
            </Text>

            <Text style={styles.sectionTitle}>Memories</Text>
            {journal.memories.map((memory, index) => (
              <Text key={index} style={styles.memoryItem}>• {memory}</Text>
            ))}

            <View style={styles.stats}>
              <Text style={styles.stat}>♥ {journal.likes} likes</Text>
              <Text style={styles.stat}>💬 {journal.comments} comments</Text>
            </View>

            <Text style={styles.flipHint}>Tap to see photo</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  card: {
    width: width - 32,
    height: height * 0.7,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 16,
  },
  memoryItem: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
    paddingLeft: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  stat: {
    fontSize: 14,
    color: '#6b7280',
  },
  flipHint: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    fontSize: 14,
    color: '#9ca3af',
  },
}); 