import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FlippableImageProps {
  content: string;
  timestamp: number;
  location?: string;
  caption?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  isDeleteMode?: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  id: string;
  isFromProfile?: boolean;
  onLongPress: () => void;
}

const FlippableImage: React.FC<FlippableImageProps> = ({
  content,
  timestamp,
  location = '',
  caption = '',
  onDelete,
  onEdit,
  isDeleteMode,
  isFlipped,
  onFlip,
  id,
  isFromProfile,
  onLongPress,
}) => {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number | null>(null);

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      if (!isDeleteMode) {
        onFlip();
      }
      lastTap.current = null;
    } else {
      lastTap.current = now;
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const getFormattedDate = (timestamp: number) => {
    const date = new Date(timestamp);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <TouchableWithoutFeedback 
      onPress={handleDoubleTap}
      onLongPress={onLongPress}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.flipCard, frontAnimatedStyle]}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: content }}
              style={styles.image}
              resizeMode="cover"
            />
            {isDeleteMode && onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={onDelete}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <Animated.View style={[styles.flipCard, styles.flipCardBack, backAnimatedStyle]}>
          <View style={styles.imageWrapper}>
            <View style={styles.backContent}>
              <View style={styles.backInfo}>
                <Text style={styles.locationText}>{location || 'No location'}</Text>
                <Text style={styles.captionText}>{caption || 'No caption'}</Text>
                <Text style={styles.dateText}>{getFormattedDate(timestamp)}</Text>
              </View>
              {isFromProfile && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={onEdit}
                >
                  <Ionicons name="pencil" size={20} color="black" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    marginVertical: 10,
  },
  flipCard: {
    width: '100%',
    backfaceVisibility: 'hidden',
  },
  flipCardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    padding: 30,
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 2,
  },
  backContent: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  backInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    fontFamily: 'Courier',
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
  },
  captionText: {
    fontFamily: 'Courier',
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  dateText: {
    fontFamily: 'Courier',
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    padding: 10,
    zIndex: 2,
  },
  modalInput: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 15,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    marginBottom: 15,
  },
});

export default FlippableImage; 