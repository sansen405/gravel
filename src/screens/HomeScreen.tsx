import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Text,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Manrope_700Bold, Manrope_400Regular } from '@expo-google-fonts/manrope';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import PinnedJournalCard from '../components/PinnedJournalCard';
import BottomNavBar from '../components/BottomNavBar';
import LoadingScreen from '../components/LoadingScreen';
import { TravelJournal } from '../types';

type RootStackParamList = {
  Home: undefined;
  Journal: {
    id: string;
    city: string;
    journal: TravelJournal;
  };
  AddJournal: {
    selectedImage?: string;
  };
};

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const CARD_MARGIN = 8;
const CARDS_PER_ROW = 2;
const CARD_WIDTH = (width - (GRID_PADDING * 2) - (CARD_MARGIN * (CARDS_PER_ROW + 1))) / CARDS_PER_ROW;

const SAMPLE_JOURNALS: TravelJournal[] = [
  {
    id: '1',
    city: 'Paris',
    country: 'France',
    dateCreated: '2024-03-14',
    coverImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
    entries: [],
  },
  {
    id: '2',
    city: 'Kyoto',
    country: 'Japan',
    dateCreated: '2024-02-20',
    coverImage: 'https://images.unsplash.com/photo-1624253321171-1be53e12f5f4',
    entries: [],
  },
  {
    id: '3',
    city: 'Santorini',
    country: 'Greece',
    dateCreated: '2024-01-10',
    coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
    entries: [],
  },
  {
    id: '4',
    city: 'Marrakech',
    country: 'Morocco',
    dateCreated: '2024-03-01',
    coverImage: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70',
    entries: [],
  },
  {
    id: '5',
    city: 'Venice',
    country: 'Italy',
    dateCreated: '2024-02-01',
    coverImage: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0',
    entries: [],
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState('Home');
  const [showFabMenu, setShowFabMenu] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [fontsLoaded] = useFonts({
    Manrope_700Bold,
    Manrope_400Regular,
  });

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to upload photos!');
        }
      }
    })();
  }, []);

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // Handle the selected image
        const selectedImage = result.assets[0];
        // Navigate to AddJournal with the selected image
        navigation.navigate('AddJournal', {
          selectedImage: selectedImage.uri,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error selecting image. Please try again.');
    }
    setShowFabMenu(false);
  };

  const renderPinboardGrid = () => {
    const sortedJournals = [...SAMPLE_JOURNALS].sort((a, b) => {
      const dateComparison = new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
      if (dateComparison !== 0) return dateComparison;
      return (b.entries?.length || 0) - (a.entries?.length || 0);
    });

    const rows = [];
    for (let i = 0; i < sortedJournals.length; i += CARDS_PER_ROW) {
      const rowItems = sortedJournals.slice(i, i + CARDS_PER_ROW);
      rows.push(
        <View key={`row-${i}`} style={styles.gridRow}>
          {rowItems.map((journal) => (
            <PinnedJournalCard
              key={journal.id}
              journal={journal}
              onPress={() => navigation.navigate('Journal', {
                id: journal.id,
                city: journal.city,
                journal: journal,
              })}
            />
          ))}
          {rowItems.length < CARDS_PER_ROW && (
            <View style={{ width: CARD_WIDTH, margin: CARD_MARGIN }} />
          )}
        </View>
      );
    }

    return (
      <View style={styles.pinboard}>
        {rows}
      </View>
    );
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: () => {} }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Travel Memories</Text>
          <Text style={styles.subtitle}>Your adventures around the world</Text>
        </View>

        {renderPinboardGrid()}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowFabMenu(true)}
      >
        <Ionicons name="add" size={32} color={colors.white} />
      </TouchableOpacity>

      <Modal
        visible={showFabMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFabMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFabMenu(false)}
        >
          <View style={styles.fabMenu}>
            <TouchableOpacity 
              style={styles.fabMenuItem}
              onPress={() => {
                setShowFabMenu(false);
                navigation.navigate('AddJournal', { selectedImage: undefined });
              }}
            >
              <Ionicons name="journal-outline" size={24} color={colors.textPrimary} />
              <Text style={styles.fabMenuText}>New Journal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.fabMenuItem}
              onPress={handleAddPhoto}
            >
              <Ionicons name="camera-outline" size={24} color={colors.textPrimary} />
              <Text style={styles.fabMenuText}>Upload Photo</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNavBar
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 32,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    color: colors.textSecondary,
  },
  pinboard: {
    paddingHorizontal: GRID_PADDING,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: CARD_MARGIN,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.sage,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 100,
  },
  fabMenu: {
    backgroundColor: colors.white,
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  fabMenuText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 16,
  },
}); 