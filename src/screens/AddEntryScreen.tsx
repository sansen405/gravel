import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { JournalEntry } from '../types';
import ImagePickerButton from '../components/ImagePickerButton';

export default function AddEntryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [image, setImage] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');

  const handleCreate = () => {
    if (!image || !caption) {
      Alert.alert('Missing Fields', 'Please select an image and add a caption');
      return;
    }

    if (caption.split(' ').length > 3) {
      Alert.alert('Invalid Caption', 'Caption must be three words or less');
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      image,
      caption,
      location,
      dateCreated: new Date().toISOString(),
    };

    // TODO: Add to actual data storage
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Image</Text>
        <ImagePickerButton
          onImagePicked={setImage}
          existingImage={image}
        />

        <Text style={styles.label}>Caption (3 words max)</Text>
        <TextInput
          style={styles.input}
          value={caption}
          onChangeText={setCaption}
          placeholder="Enter caption"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.label}>Location (optional)</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
          placeholderTextColor={colors.textSecondary}
        />

        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Add Entry</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.sage,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
}); 