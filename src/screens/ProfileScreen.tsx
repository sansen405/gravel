import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

interface Journal {
  id: string;
  title: string;
  description: string;
  date: string;
  images: string[];
  items: any[]; // Assuming a generic type for items
}

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isAddingJournal, setIsAddingJournal] = useState(false);
  const [newJournal, setNewJournal] = useState({
    title: '',
    description: '',
    images: [] as string[],
  });

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

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const currentUser = JSON.parse(userStr);
          const updatedUser = {
            ...currentUser,
            profileImage: result.assets[0].uri
          };
          
          // Save to AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Update the auth context
          updateProfile({ profileImage: result.assets[0].uri });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const pickJournalImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setNewJournal(prev => ({
          ...prev,
          images: [...prev.images, ...newImages],
        }));
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to add images');
    }
  };

  const saveJournal = async () => {
    if (!newJournal.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      const journal = {
        id: Date.now().toString(),
        title: newJournal.title,
        description: newJournal.description,
        date: new Date().toISOString(),
        items: [], // Initialize empty items array
        images: [], // Keep images array for backward compatibility
      };

      const updatedJournals = [...journals, journal];
      await AsyncStorage.setItem('journals', JSON.stringify(updatedJournals));
      setJournals(updatedJournals);
      setIsAddingJournal(false);
      setNewJournal({ title: '', description: '', images: [] });
    } catch (error) {
      console.error('Error saving journal:', error);
      Alert.alert('Error', 'Failed to save journal');
    }
  };

  const renderJournal = ({ item }) => (
    <TouchableOpacity
      style={styles.journalCard}
      onPress={() => navigation.navigate('JournalDetail', { 
        journal: item,
        isFromProfile: true
      })}
    >
      {item.images.length > 0 && (
        <Image
          source={{ uri: item.images[0] }}
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
          {item.images.length} {item.images.length === 1 ? 'photo' : 'photos'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => setIsAddingJournal(true)}
            style={styles.addButton}
          >
            <Ionicons name="add-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileInfo}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={pickImage}
        >
          {user?.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person-outline" size={40} color="#666666" />
            </View>
          )}
          <View style={styles.editImageBadge}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Text style={styles.displayName}>{user?.displayName}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <Text style={styles.bio}>{user?.bio || 'No bio yet'}</Text>
      </View>

      <FlatList
        data={journals}
        renderItem={renderJournal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.journalsList}
      />

      <Modal
        visible={isAddingJournal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.topModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Journal</Text>
              <TouchableOpacity 
                onPress={() => {
                  setIsAddingJournal(false);
                  setNewJournal({ title: '', description: '', images: [] });
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor="#666666"
              value={newJournal.title}
              onChangeText={(text) => setNewJournal(prev => ({ ...prev, title: text }))}
            />

            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description"
              placeholderTextColor="#666666"
              value={newJournal.description}
              onChangeText={(text) => setNewJournal(prev => ({ ...prev, description: text }))}
              multiline
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={saveJournal}
            >
              <Text style={styles.submitButtonText}>Create Journal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  addButton: {
    padding: 8,
    marginRight: 8,
  },
  logoutButton: {
    padding: 8,
  },
  profileInfo: {
    alignItems: 'center',
    padding: 10,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  profileImagePlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#333333',
    borderRadius: 10,
    padding: 4,
  },
  displayName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#888888',
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
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
    height: 200,
    backgroundColor: '#222222',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-start',
  },
  topModalContent: {
    backgroundColor: '#111111',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    marginTop: 50,
    margin: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  closeButton: {
    padding: 5,
  },
  input: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 15,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    marginBottom: 15,
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default ProfileScreen;