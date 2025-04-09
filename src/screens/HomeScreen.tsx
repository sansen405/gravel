import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlippableImage from '../components/FlippableImage';

interface ImageItem {
  id: string;
  content: string;
  timestamp: number;
  journalId: string;
  journalTitle: string;
  location?: string;
  caption?: string;
  journal: any;
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [flippedImageId, setFlippedImageId] = useState<string | null>(null);

  const loadImages = async () => {
    try {
      const journalsStr = await AsyncStorage.getItem('journals');
      if (!journalsStr) return;

      const journals = JSON.parse(journalsStr);
      const allImages: ImageItem[] = [];

      journals.forEach(journal => {
        if (journal.items) {
          const photoItems = journal.items
            .filter(item => item.type === 'photo')
            .map(item => ({
              id: item.id,
              content: item.content,
              timestamp: item.timestamp,
              journalId: journal.id,
              journalTitle: journal.title,
              location: item.location,
              caption: item.caption,
              journal: journal
            }));
          allImages.push(...photoItems);
        }
      });

      // Sort by timestamp, most recent first
      allImages.sort((a, b) => b.timestamp - a.timestamp);
      setImageItems(allImages);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadImages();
    }, [])
  );

  const handleImageFlip = (imageId: string) => {
    setFlippedImageId(flippedImageId === imageId ? null : imageId);
  };

  const renderImage = ({ item }: { item: ImageItem }) => (
    <View style={styles.imageContainer}>
      <TouchableOpacity 
        style={styles.userInfo}
        onPress={() => navigation.navigate('MainTabs', { 
          screen: 'ProfileTab',
          params: {
            username: 'developer',
            isOwnProfile: false
          }
        })}
      >
        <Text style={styles.username}>@developer</Text>
      </TouchableOpacity>

      <FlippableImage
        id={item.id}
        content={item.content}
        timestamp={item.timestamp}
        location={item.location}
        caption={item.caption}
        isFlipped={flippedImageId === item.id}
        onFlip={() => handleImageFlip(item.id)}
        isFromProfile={false}
        onLongPress={() => {}}
        isDeleteMode={false}
      />

      <TouchableOpacity
        style={styles.journalInfo}
        onPress={() => navigation.navigate('JournalDetail', {
          journal: item.journal,
          isFromProfile: true
        })}
      >
        <Text style={styles.journalTitle}>{item.journalTitle}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gravel</Text>
      </View>

      <FlatList
        data={imageItems}
        renderItem={renderImage}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.imageList}
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
  imageList: {
    padding: 15,
  },
  imageContainer: {
    marginBottom: 20,
    backgroundColor: '#111111',
    borderRadius: 12,
    overflow: 'hidden',
  },
  userInfo: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  username: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
  },
  journalInfo: {
    padding: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  journalTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
});

export default HomeScreen; 