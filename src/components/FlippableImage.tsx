import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useFonts, CutiveMono_400Regular } from '@expo-google-fonts/cutive-mono';
import { colors } from '../theme/colors';
import { JournalEntry } from '../types';

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
const BORDER_WIDTH = 31; // Another 15% smaller than 36px
const IMAGE_WIDTH = isMobile ? 322 : 672; // Increased to maintain same total size
const IMAGE_HEIGHT = (IMAGE_WIDTH * 9) / 16; // 16:9 aspect ratio

interface FlippableImageProps {
  entry: JournalEntry;
  onEdit?: (updatedEntry: Partial<JournalEntry>) => void;
  onDelete?: () => void;
}

export default function FlippableImage({ entry, onEdit, onDelete }: FlippableImageProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(entry.caption);
  const [editedLocation, setEditedLocation] = useState(entry.location || '');
  const [flipAnim] = useState(new Animated.Value(0));

  const [fontsLoaded] = useFonts({
    CutiveMono_400Regular,
  });

  const flipCard = useCallback(() => {
    if (isEditing) return;
    
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  }, [isFlipped, isEditing, flipAnim]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onEdit) {
      onEdit({
        caption: editedCaption,
        location: editedLocation || undefined,
      });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={flipCard}>
        <View style={styles.cardContainer}>
          <Animated.View style={[
            styles.card,
            {
              transform: [{ rotateY: frontInterpolate }],
              zIndex: isFlipped ? 0 : 1,
            }
          ]}>
            <View style={styles.imageFrame}>
              <Image
                source={{ uri: entry.image }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          </Animated.View>

          <Animated.View style={[
            styles.card,
            styles.cardBack,
            {
              transform: [{ rotateY: backInterpolate }],
              zIndex: isFlipped ? 1 : 0,
            }
          ]}>
            <View style={styles.imageFrame}>
              {!isEditing ? (
                <>
                  <View style={styles.backTextContainer}>
                    <Text style={styles.backText}>{entry.caption}</Text>
                    {entry.location && <Text style={styles.backText}>{entry.location}</Text>}
                    <Text style={styles.backText}>
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleEdit}>
                      <Text style={styles.backText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete}>
                      <Text style={styles.backText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.input}
                    value={editedCaption}
                    onChangeText={setEditedCaption}
                    placeholder="Caption (3 words max)"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TextInput
                    style={styles.input}
                    value={editedLocation}
                    onChangeText={setEditedLocation}
                    placeholder="Location (optional)"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.backText}>Save</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
    width: IMAGE_WIDTH + (BORDER_WIDTH * 2),
    height: IMAGE_HEIGHT + (BORDER_WIDTH * 2),
    alignSelf: 'center',
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  imageFrame: {
    flex: 1,
    padding: BORDER_WIDTH,
    backgroundColor: colors.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  backTextContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  backText: {
    fontFamily: 'CutiveMono_400Regular',
    fontSize: isMobile ? 8.5 : 17, // 50% smaller on mobile
    color: colors.textPrimary,
    marginBottom: 4,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 16,
  },
  editContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  input: {
    fontFamily: 'CutiveMono_400Regular',
    fontSize: isMobile ? 8.5 : 17, // 50% smaller on mobile
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
    paddingVertical: 4,
    marginBottom: 12,
  },
}); 