import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Share,
  Alert,
  Platform,
  ActivityIndicator,
  Switch
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { colors } from '../theme/colors';
import { JournalEntry, TravelJournal } from '../types';
import FlippableImage from '../components/FlippableImage';
import LoadingScreen from '../components/LoadingScreen';

type RootStackParamList = {
  Journal: { id: string; city: string; journal: TravelJournal };
  AddEntry: { journalId: string; onAddEntry: (entry: JournalEntry) => void };
};

type JournalScreenProps = {
  route: RouteProp<RootStackParamList, 'Journal'>;
};

export default function JournalScreen({ route }: JournalScreenProps) {
  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    // Return different entries based on the city
    switch (route.params.city) {
      case 'Paris':
        return [
          {
            id: '1',
            image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
            caption: 'Sunset at Eiffel',
            date: '2024-03-15',
            location: 'Eiffel Tower'
          },
          {
            id: '2',
            image: 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b',
            caption: 'Morning Light',
            date: '2024-03-16',
            location: 'Le Marais'
          },
          {
            id: '3',
            image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
            caption: 'Seine River Walk',
            date: '2024-03-17',
            location: 'River Seine'
          }
        ];

      case 'Kyoto':
        return [
          {
            id: '1',
            image: 'https://images.unsplash.com/photo-1624253321171-1be53e12f5f4',
            caption: 'Sacred Gates',
            date: '2024-02-20',
            location: 'Fushimi Inari'
          },
          {
            id: '2',
            image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
            caption: 'Golden Temple',
            date: '2024-02-21',
            location: 'Kinkaku-ji'
          },
          {
            id: '3',
            image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186',
            caption: 'Bamboo Forest',
            date: '2024-02-22',
            location: 'Arashiyama'
          }
        ];

      case 'Santorini':
        return [
          {
            id: '1',
            image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
            caption: 'Blue Domes',
            date: '2024-01-10',
            location: 'Oia'
          },
          {
            id: '2',
            image: 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a',
            caption: 'Sunset Views',
            date: '2024-01-11',
            location: 'Fira'
          },
          {
            id: '3',
            image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6',
            caption: 'White Houses',
            date: '2024-01-12',
            location: 'Imerovigli'
          }
        ];

      case 'Marrakech':
        return [
          {
            id: '1',
            image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70',
            caption: 'Medina Life',
            date: '2024-03-01',
            location: 'Old Medina'
          },
          {
            id: '2',
            image: 'https://images.unsplash.com/photo-1548759806-821cafe3fc00',
            caption: 'Spice Market',
            date: '2024-03-02',
            location: 'Souk'
          },
          {
            id: '3',
            image: 'https://images.unsplash.com/photo-1553899017-4ff76981e05f',
            caption: 'Garden Peace',
            date: '2024-03-03',
            location: 'Jardin Majorelle'
          }
        ];

      case 'Venice':
        return [
          {
            id: '1',
            image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0',
            caption: 'Grand Canal',
            date: '2024-02-01',
            location: 'Rialto Bridge'
          },
          {
            id: '2',
            image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9',
            caption: 'Morning Gondolas',
            date: '2024-02-02',
            location: 'San Marco'
          },
          {
            id: '3',
            image: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f',
            caption: 'Venetian Paths',
            date: '2024-02-03',
            location: 'Dorsoduro'
          }
        ];

      default:
        return [];
    }
  });

  const handleAddEntry = (newEntry: JournalEntry) => {
    setEntries(prevEntries => [...prevEntries, newEntry]);
  };

  const handleEditEntry = (entryId: string, updatedEntry: Partial<JournalEntry>) => {
    setEntries(prevEntries => 
      prevEntries.map(entry => 
        entry.id === entryId ? { ...entry, ...updatedEntry } : entry
      )
    );
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries(prevEntries => 
      prevEntries.filter(entry => entry.id !== entryId)
    );
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${route.params.journal.city} Travel Journal`,
        message: `Check out my travel memories from ${route.params.journal.city}, ${route.params.journal.country}!`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share journal');
    }
  };

  const handleExport = () => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Journal exported successfully!',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.location}>{route.params.journal.city}, {route.params.journal.country}</Text>
            <Text style={styles.date}>
              Started on {new Date(route.params.journal.dateCreated).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <View style={styles.leftActions}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {entries.reduce((acc, entry) => acc + (entry.location ? 1 : 0), 0)}
                </Text>
                <Text style={styles.statLabel}>Places</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleExport}
              >
                <Ionicons name="download-outline" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.rightActions}>
              <View style={styles.visibilityContainer}>
                <Ionicons 
                  name={isPublic ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={colors.textSecondary} 
                  style={styles.visibilityIcon}
                />
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: colors.lightGray, true: colors.sage }}
                  thumbColor={colors.white}
                />
              </View>
            </View>
          </View>
        </View>

        {showInfo && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>About this Journal</Text>
            <Text style={styles.infoText}>
              Tap and hold any image to edit or delete. Add new memories using the + button.
            </Text>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.sage} />
            <Text style={styles.loadingText}>Exporting journal...</Text>
          </View>
        )}

        <View style={styles.entriesList}>
          {entries.length > 0 ? (
            entries.map((entry) => (
              <FlippableImage 
                key={entry.id} 
                entry={{
                  ...entry,
                  date: entry.date || entry.dateCreated || new Date().toISOString(),
                }}
                onEdit={(updatedEntry) => handleEditEntry(entry.id, updatedEntry)}
                onDelete={() => handleDeleteEntry(entry.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Memories Yet</Text>
              <Text style={styles.emptyStateSubtitle}>Add your first memory!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddEntry', {
          journalId: route.params.id,
          onAddEntry: handleAddEntry,
        })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  header: {
    padding: 24,
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  date: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  statNumber: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 20,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButton: {
    padding: 8,
  },
  visibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityIcon: {
    marginRight: 8,
  },
  infoCard: {
    padding: 24,
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 16,
  },
  entriesList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
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
  fabText: {
    fontSize: 32,
    color: colors.textPrimary,
    marginTop: -2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
}); 