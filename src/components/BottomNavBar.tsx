import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type NavItem = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', icon: 'home-outline' },
  { name: 'Search', icon: 'search-outline' },
  { name: 'Favorites', icon: 'heart-outline' },
  { name: 'Profile', icon: 'person-outline' },
];

interface BottomNavBarProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

export default function BottomNavBar({ activeTab, onTabPress }: BottomNavBarProps) {
  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={styles.tabButton}
          onPress={() => onTabPress(item.name)}
        >
          <Ionicons
            name={item.icon}
            size={24}
            color={activeTab === item.name ? colors.sage : colors.textSecondary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingBottom: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
}); 