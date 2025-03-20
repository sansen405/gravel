import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TravelJournal } from '../types';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface JournalCardProps {
  journal: TravelJournal;
  onPress: () => void;
  scrollX: Animated.Value;
  index: number;
}

export default function JournalCard({ journal, onPress, scrollX, index }: JournalCardProps) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.9, 1, 0.9],
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.5, 1, 0.5],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <ImageBackground
          source={{ uri: journal.coverImage }}
          style={styles.imageBackground}
          imageStyle={styles.image}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          >
            <View style={styles.content}>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={24} color={colors.white} />
                <Text style={styles.cityText}>{journal.city}</Text>
              </View>
              <Text style={styles.countryText}>{journal.country}</Text>
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{journal.entries?.length || 0}</Text>
                  <Text style={styles.statLabel}>Memories</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>
                    {new Date(journal.dateCreated).toLocaleDateString('en-US', { 
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.statLabel}>Date</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: height * 0.75,
    paddingHorizontal: 16,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cityText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 32,
    color: colors.white,
    marginLeft: 8,
  },
  countryText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 18,
    color: colors.white,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 20,
    color: colors.white,
  },
  statLabel: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: colors.white,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
}); 