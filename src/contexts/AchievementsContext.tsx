import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  category: 'photos' | 'journals' | 'time' | 'location';
  icon: string;
}

const ACHIEVEMENTS: Achievement[] = [
  // Photo Count Achievements
  {
    id: 'first_photo',
    title: 'First Memory',
    description: 'Upload your first photo',
    progress: 0,
    maxProgress: 1,
    completed: false,
    category: 'photos',
    icon: 'camera',
  },
  {
    id: 'photo_enthusiast',
    title: 'Photo Enthusiast',
    description: 'Upload 10 photos',
    progress: 0,
    maxProgress: 10,
    completed: false,
    category: 'photos',
    icon: 'images',
  },
  {
    id: 'photography_pro',
    title: 'Photography Pro',
    description: 'Upload 50 photos',
    progress: 0,
    maxProgress: 50,
    completed: false,
    category: 'photos',
    icon: 'camera',
  },

  // Journal Achievements
  {
    id: 'journal_creator',
    title: 'Journal Creator',
    description: 'Create your first journal',
    progress: 0,
    maxProgress: 1,
    completed: false,
    category: 'journals',
    icon: 'book',
  },
  {
    id: 'active_traveler',
    title: 'Active Traveler',
    description: 'Create 5 journals with photos',
    progress: 0,
    maxProgress: 5,
    completed: false,
    category: 'journals',
    icon: 'airplane',
  },
  {
    id: 'photo_collection',
    title: 'Photo Collection',
    description: 'Create a journal with 5+ photos',
    progress: 0,
    maxProgress: 1,
    completed: false,
    category: 'journals',
    icon: 'images',
  },

  // Time-based Achievements
  {
    id: 'consistent_photographer',
    title: 'Consistent Photographer',
    description: 'Upload photos in 3 consecutive months',
    progress: 0,
    maxProgress: 3,
    completed: false,
    category: 'time',
    icon: 'calendar',
  },
  {
    id: 'year_in_review',
    title: 'Year in Review',
    description: 'Upload photos in all four seasons',
    progress: 0,
    maxProgress: 4,
    completed: false,
    category: 'time',
    icon: 'time',
  },

  // Location-based Achievements
  {
    id: 'city_explorer',
    title: 'City Explorer',
    description: 'Visit 3 different cities',
    progress: 0,
    maxProgress: 3,
    completed: false,
    category: 'location',
    icon: 'business',
  },
  {
    id: 'nature_lover',
    title: 'Nature Lover',
    description: 'Visit 3 nature locations',
    progress: 0,
    maxProgress: 3,
    completed: false,
    category: 'location',
    icon: 'leaf',
  },
];

const AchievementsContext = createContext<{
  achievements: Achievement[];
  checkAchievements: () => Promise<void>;
  updateAchievements: (journals: any[]) => Promise<void>;
} | null>(null);

export const AchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const savedAchievements = await AsyncStorage.getItem('achievements');
      if (savedAchievements) {
        setAchievements(JSON.parse(savedAchievements));
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const saveAchievements = async (newAchievements: Achievement[]) => {
    try {
      await AsyncStorage.setItem('achievements', JSON.stringify(newAchievements));
      setAchievements(newAchievements);
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  };

  const updateAchievements = async (journals: any[]) => {
    const newAchievements = [...achievements];
    let hasUpdates = false;

    // Count total photos
    const totalPhotos = journals.reduce((count, journal) => {
      return count + (journal.items?.filter((item: any) => item.type === 'photo').length || 0);
    }, 0);

    // Photo count achievements
    const photoAchievements = newAchievements.filter(a => a.category === 'photos');
    photoAchievements.forEach(achievement => {
      const newProgress = Math.min(totalPhotos, achievement.maxProgress);
      if (newProgress !== achievement.progress) {
        achievement.progress = newProgress;
        achievement.completed = newProgress >= achievement.maxProgress;
        hasUpdates = true;
      }
    });

    // Journal achievements
    const journalAchievements = newAchievements.filter(a => a.category === 'journals');
    const journalsWithPhotos = journals.filter(j => 
      j.items?.some((item: any) => item.type === 'photo')
    ).length;
    const hasJournalWith5Photos = journals.some(j => 
      (j.items?.filter((item: any) => item.type === 'photo').length || 0) >= 5
    );

    journalAchievements.forEach(achievement => {
      let newProgress = 0;
      switch (achievement.id) {
        case 'journal_creator':
          newProgress = journals.length > 0 ? 1 : 0;
          break;
        case 'active_traveler':
          newProgress = Math.min(journalsWithPhotos, achievement.maxProgress);
          break;
        case 'photo_collection':
          newProgress = hasJournalWith5Photos ? 1 : 0;
          break;
      }
      if (newProgress !== achievement.progress) {
        achievement.progress = newProgress;
        achievement.completed = newProgress >= achievement.maxProgress;
        hasUpdates = true;
      }
    });

    // Time-based achievements
    const photoMonths = new Set();
    const photoSeasons = new Set();
    journals.forEach(journal => {
      journal.items?.forEach((item: any) => {
        if (item.type === 'photo') {
          const date = new Date(item.timestamp);
          photoMonths.add(date.getMonth());
          photoSeasons.add(Math.floor(date.getMonth() / 3));
        }
      });
    });

    const timeAchievements = newAchievements.filter(a => a.category === 'time');
    timeAchievements.forEach(achievement => {
      let newProgress = 0;
      switch (achievement.id) {
        case 'consistent_photographer':
          newProgress = Math.min(photoMonths.size, achievement.maxProgress);
          break;
        case 'year_in_review':
          newProgress = Math.min(photoSeasons.size, achievement.maxProgress);
          break;
      }
      if (newProgress !== achievement.progress) {
        achievement.progress = newProgress;
        achievement.completed = newProgress >= achievement.maxProgress;
        hasUpdates = true;
      }
    });

    // Location-based achievements
    const locationKeywords = {
      cities: ['city', 'town', 'downtown', 'urban'],
      nature: ['mountain', 'beach', 'forest', 'lake', 'park', 'trail', 'hiking'],
    };

    const uniqueCities = new Set();
    const uniqueNature = new Set();

    journals.forEach(journal => {
      const text = `${journal.title} ${journal.description}`.toLowerCase();
      
      locationKeywords.cities.forEach(keyword => {
        if (text.includes(keyword)) uniqueCities.add(text);
      });
      
      locationKeywords.nature.forEach(keyword => {
        if (text.includes(keyword)) uniqueNature.add(text);
      });
    });

    const locationAchievements = newAchievements.filter(a => a.category === 'location');
    locationAchievements.forEach(achievement => {
      let newProgress = 0;
      switch (achievement.id) {
        case 'city_explorer':
          newProgress = Math.min(uniqueCities.size, achievement.maxProgress);
          break;
        case 'nature_lover':
          newProgress = Math.min(uniqueNature.size, achievement.maxProgress);
          break;
      }
      if (newProgress !== achievement.progress) {
        achievement.progress = newProgress;
        achievement.completed = newProgress >= achievement.maxProgress;
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      await saveAchievements(newAchievements);
    }
  };

  return (
    <AchievementsContext.Provider value={{ 
      achievements, 
      checkAchievements: loadAchievements,
      updateAchievements 
    }}>
      {children}
    </AchievementsContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
}; 