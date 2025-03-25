import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors } from '../theme/colors';
import { RootStackParamList, TravelJournal, User } from '../types';
import PinnedJournalCard from '../components/PinnedJournalCard';

type SearchTab = 'journals' | 'users' | 'locations';

// Using the same mock data structure as HomeScreen
const MOCK_JOURNALS = [
  // ... same mock data as before ...
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('journals');
  const [loading, setLoading] = useState(false);
  const [journals, setJournals] = useState<TravelJournal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [filteredJournals, setFilteredJournals] = useState(MOCK_JOURNALS);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (searchQuery.length > 0) {
      handleSearch();
    }
  }, [searchQuery, activeTab]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (activeTab === 'journals') {
        const journalsQuery = query(
          collection(db, 'journals'),
          where('isPublic', '==', true),
          where('city', '>=', searchQuery),
          where('city', '<=', searchQuery + '\uf8ff'),
          orderBy('city'),
          limit(20)
        );
        const snapshot = await getDocs(journalsQuery);
        setJournals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TravelJournal)));
      } else if (activeTab === 'users') {
        const usersQuery = query(
          collection(db, 'users'),
          where('username', '>=', searchQuery.toLowerCase()),
          where('username', '<=', searchQuery.toLowerCase() + '\uf8ff'),
          limit(20)
        );
        const snapshot = await getDocs(usersQuery);
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
      } else if (activeTab === 'locations') {
        const locationsQuery = query(
          collection(db, 'journals'),
          where('isPublic', '==', true),
          orderBy('city'),
          limit(20)
        );
        const snapshot = await getDocs(locationsQuery);
        const uniqueLocations = new Set(snapshot.docs.map(doc => doc.data().city));
        setLocations(Array.from(uniqueLocations));
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderJournal = ({ item }: { item: TravelJournal }) => (
    <PinnedJournalCard
      journal={item}
      onPress={() => navigation.navigate('Journal', {
        id: item.id,
        city: item.city,
        journal: item,
      })}
    />
  );

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate('Profile', { userId: item.id })}
    >
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.displayName}>{item.displayName}</Text>
        <Text style={styles.journalCount}>{item.journalCount} journals</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderLocation = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.locationCard}
      onPress={() => setSearchQuery(item)}
    >
      <Ionicons name="location" size={24} color={colors.sage} />
      <Text style={styles.locationText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search journals, locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'journals' && styles.activeTab]}
          onPress={() => setActiveTab('journals')}
        >
          <Text style={[styles.tabText, activeTab === 'journals' && styles.activeTabText]}>
            Journals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'locations' && styles.activeTab]}
          onPress={() => setActiveTab('locations')}
        >
          <Text style={[styles.tabText, activeTab === 'locations' && styles.activeTabText]}>
            Locations
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.sage} />
      ) : (
        <View style={styles.results}>
          {activeTab === 'journals' && (
            <FlatList
              data={filteredJournals}
              renderItem={renderJournal}
              keyExtractor={item => item.id}
              numColumns={2}
              contentContainerStyle={styles.journalGrid}
              showsVerticalScrollIndicator={false}
            />
          )}
          {activeTab === 'users' && (
            <FlatList
              data={users}
              renderItem={renderUser}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.userList}
              showsVerticalScrollIndicator={false}
            />
          )}
          {activeTab === 'locations' && (
            <FlatList
              data={locations}
              renderItem={renderLocation}
              keyExtractor={item => item}
              contentContainerStyle={styles.locationList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.sage,
  },
  tabText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.sage,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  results: {
    flex: 1,
  },
  journalGrid: {
    padding: 8,
  },
  userList: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  displayName: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  journalCount: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: colors.sage,
  },
  locationList: {
    padding: 16,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
  },
}); 