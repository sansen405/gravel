import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TravelJournal } from '../types';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const CARD_MARGIN = 8;
const CARDS_PER_ROW = 2;
const CARD_WIDTH = (width - (GRID_PADDING * 2) - (CARD_MARGIN * (CARDS_PER_ROW + 1))) / CARDS_PER_ROW;

interface PinnedJournalCardProps {
  journal: TravelJournal;
  onPress: () => void;
  isFeatured?: boolean;
}

export default function PinnedJournalCard({ 
  journal, 
  onPress, 
  isFeatured = false,
}: PinnedJournalCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 1.02,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: journal.coverImage }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.content}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color={colors.sage} />
            <Text style={styles.cityText}>{journal.city}</Text>
          </View>
          <Text style={styles.countryText}>{journal.country}</Text>
          <View style={styles.footer}>
            <Text style={styles.dateText}>
              {new Date(journal.dateCreated).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </Text>
            <Text style={styles.entriesCount}>
              {journal.entries?.length || 0} memories
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: CARD_MARGIN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  touchable: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 12,
    backgroundColor: colors.white,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cityText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 4,
  },
  countryText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    opacity: 0.8,
  },
  entriesCount: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: colors.sage,
  },
}); 