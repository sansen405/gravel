import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  // Empty array for new users - they start with no journals
  const userJournals = [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://via.placeholder.com/100' }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>
          {user?.displayName || 'User'}
        </Text>
        <Text style={styles.username}>
          {user?.username || 'traveler'}
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userJournals.length}</Text>
          <Text style={styles.statLabel}>Journals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
      </View>

      {userJournals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            You haven't created any travel journals yet.
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateJournal')}
          >
            <Text style={styles.createButtonText}>Create Your First Journal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>My Journals</Text>
          <FlatList
            data={userJournals}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.journalCard}
                onPress={() => navigation.navigate('JournalDetail', { journalId: item.id })}
              >
                <Text style={styles.journalTitle}>{item.title}</Text>
                <Text style={styles.journalLocation}>{item.city}, {item.country}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  username: {
    fontSize: 16,
    color: '#6b7280',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  journalCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  journalLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});