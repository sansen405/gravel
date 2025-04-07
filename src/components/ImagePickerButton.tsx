import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';

interface ImagePickerButtonProps {
  onImagePicked: (uri: string) => void;
  existingImage?: string;
  style?: any;
}

export default function ImagePickerButton({ onImagePicked, existingImage, style }: ImagePickerButtonProps) {
  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Pick the image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      onImagePicked(result.assets[0].uri);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={pickImage}
    >
      {existingImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: existingImage }} style={styles.image} />
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Tap to change</Text>
          </View>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.text}>Pick an Image</Text>
          <Text style={styles.icon}>+</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.skyBlue,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#a0a0a0',
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
  },
  username: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#a0a0a0',
  },
  journalTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#ffffff',
  },
  journalLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#a0a0a0',
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ffffff',
  },
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#a0a0a0',
  },
  quote: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    fontStyle: 'italic',
    color: '#e0e0e0',
  },
}); 