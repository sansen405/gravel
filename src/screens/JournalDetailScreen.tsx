import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import FlippableImage from '../components/FlippableImage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface JournalItem {
  id: string;
  type: 'photo' | 'note' | 'itinerary';
  content: string;
  timestamp: number;
  caption?: string;
  location?: string;
}

interface Activity {
  name: string;
  time?: string;
  location?: string;
}

interface ItineraryDay {
  date: string;
  activities: Activity[];
}

const MINIMUM_DATE = new Date('2000-01-01');
const MAXIMUM_DATE = new Date(); // Current date

const JournalDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { journal, isFromProfile } = route.params;
  const [items, setItems] = useState<JournalItem[]>(() => {
    const existingItems = journal.items || [];
    const existingPhotos = journal.images ? 
      journal.images.map((uri: string) => ({
        id: Date.now().toString() + Math.random(),
        type: 'photo' as const,
        content: uri,
        timestamp: Date.now()
      })) : [];
    return [...existingItems, ...existingPhotos];
  });
  const [showOptions, setShowOptions] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [expandedActivity, setExpandedActivity] = useState<{day: number, activity: number} | null>(null);
  const [isImageDeleteMode, setIsImageDeleteMode] = useState(false);
  const [flippedImageId, setFlippedImageId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState<JournalItem | null>(null);
  const [editingCaption, setEditingCaption] = useState('');
  const [editingLocation, setEditingLocation] = useState('');
  const [editingDate, setEditingDate] = useState('');
  const lastTap = React.useRef<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDayIndex, setDatePickerDayIndex] = useState<number | null>(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  const handleDeleteJournal = async () => {
    Alert.alert(
      'Delete Journal',
      'Are you sure you want to delete this journal?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const journalsStr = await AsyncStorage.getItem('journals');
              const journals = JSON.parse(journalsStr || '[]');
              const updatedJournals = journals.filter(j => j.id !== journal.id);
              await AsyncStorage.setItem('journals', JSON.stringify(updatedJournals));
              
              // Navigate back and refresh both screens
              navigation.goBack();
              
              // Dispatch an event to refresh both screens
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    { name: 'MainTabs' }
                  ],
                })
              );
            } catch (error) {
              console.error('Error deleting journal:', error);
              Alert.alert('Error', 'Failed to delete journal');
            }
          },
        },
      ],
    );
  };

  const saveJournalItems = async (newItems: JournalItem[]) => {
    try {
      const journalsStr = await AsyncStorage.getItem('journals');
      const journals = JSON.parse(journalsStr || '[]');
      
      const updatedJournals = journals.map(j => {
        if (j.id === journal.id) {
          return {
            ...j,
            items: newItems,
            images: newItems
              .filter(i => i.type === 'photo')
              .map(i => i.content)
          };
        }
        return j;
      });
      
      await AsyncStorage.setItem('journals', JSON.stringify(updatedJournals));
      setItems(newItems);
    } catch (error) {
      console.error('Error saving journal items:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const handleAddPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => ({
          id: Date.now().toString() + Math.random(),
          type: 'photo' as const,
          content: asset.uri,
          timestamp: Date.now(),
        }));
        
        const newItems = [...items, ...newPhotos];
        await saveJournalItems(newItems);
      }
    } catch (error) {
      console.error('Error adding photos:', error);
      Alert.alert('Error', 'Failed to add photos');
    }
    setShowOptions(false);
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      Alert.alert('Error', 'Please enter some text for the note');
      return;
    }

    const newNote: JournalItem = {
      id: Date.now().toString(),
      type: 'note',
      content: noteText,
      timestamp: Date.now(),
    };

    const newItems = [...items, newNote];
    await saveJournalItems(newItems);
    setNoteText('');
    setShowNoteModal(false);
    setShowOptions(false);
  };

  const formatItineraryAsText = (days: ItineraryDay[]): string => {
    return days.map((day) => {
      // Sort activities by time
      const sortedActivities = [...day.activities].sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });

      // Format the day's activities
      const activities = sortedActivities.map(activity => {
        let activityText = '';
        if (activity.time) {
          activityText += `\t${activity.time}`;
        }
        activityText += `\n\t\t${activity.name}${activity.location ? ` || ${activity.location}` : ''}`;
        return activityText;
      }).join('\n');

      return `${day.date}\n${activities}`;
    }).join('\n\n'); // Two newlines between days for spacing
  };

  const handleAddItinerary = async (formattedText: string) => {
    const newItinerary: JournalItem = {
      id: Date.now().toString(),
      type: 'itinerary',
      content: formattedText,
      timestamp: Date.now(),
    };

    const newItems = [...items, newItinerary];
    await saveJournalItems(newItems);
    setItineraryDays([]);
    setShowItineraryModal(false);
    setShowOptions(false);
  };

  const handleDeleteItem = async (item: JournalItem) => {
    try {
      const newItems = items.filter(i => i.id !== item.id);
      await saveJournalItems(newItems);
      setItems(newItems);
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const handleImageFlip = (imageId: string) => {
    setFlippedImageId(flippedImageId === imageId ? null : imageId);
  };

  const handleSaveImageEdit = async () => {
    if (!editingImage) return;

    try {
      const newItems = items.map(item => {
        if (item.id === editingImage.id) {
          return {
            ...item,
            caption: editingCaption,
            location: editingLocation,
            timestamp: new Date(editingDate).getTime(),
          };
        }
        return item;
      });

      await saveJournalItems(newItems);
      setItems(newItems);
      setShowEditModal(false);
      setEditingImage(null);
    } catch (error) {
      console.error('Error saving image edits:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const handleCaptionChange = (text: string) => {
    const words = text.trim().split(' ').filter(word => word.length > 0);
    
    if (words.length > 3) {
      return;
    }
    
    setEditingCaption(text);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || tempDate;
    setShowDatePicker(Platform.OS === 'ios');
    
    if (datePickerDayIndex === null) return;
    
    if (selectedDate) {
      const updatedDays = [...itineraryDays];
      updatedDays[datePickerDayIndex].date = currentDate.toLocaleDateString();
      setItineraryDays(updatedDays);
      setTempDate(currentDate);
    }
    
    if (Platform.OS === 'android') {
      setDatePickerDayIndex(null);
    }
  };

  const renderDateSelector = (day: ItineraryDay, dayIndex: number) => {
    const currentDate = day.date ? new Date(day.date) : new Date();
    
    return (
      <View>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => {
            setTempDate(currentDate);
            setDatePickerDayIndex(dayIndex);
            setShowDatePicker(true);
          }}
        >
          <Text style={styles.dateText}>Change Date: {day.date}</Text>
          <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {showDatePicker && datePickerDayIndex === dayIndex && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) {
                  const updatedDays = [...itineraryDays];
                  updatedDays[dayIndex].date = date.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                  });
                  setItineraryDays(updatedDays);
                  setTempDate(date);
                }
                if (Platform.OS === 'android') {
                  setDatePickerDayIndex(null);
                }
              }}
              style={styles.datePickerStyle}
              textColor="#FFFFFF"
              themeVariant="dark"
              minimumDate={MINIMUM_DATE}
              maximumDate={MAXIMUM_DATE}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.datePickerDoneButton}
                onPress={() => {
                  setShowDatePicker(false);
                  setDatePickerDayIndex(null);
                }}
              >
                <Text style={styles.datePickerDoneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item: JournalItem }) => {
    if (item.type === 'photo') {
      return (
        <View style={styles.itemContainer}>
          <FlippableImage
            id={item.id}
            content={item.content}
            timestamp={item.timestamp}
            location={item.location}
            caption={item.caption}
            onDelete={() => handleDeleteItem(item)}
            onEdit={() => {
              setEditingImage(item);
              setEditingCaption(item.caption || '');
              setEditingLocation(item.location || '');
              setEditingDate(new Date(item.timestamp).toISOString().split('T')[0]);
              setShowEditModal(true);
            }}
            isDeleteMode={isImageDeleteMode}
            isFlipped={flippedImageId === item.id}
            onFlip={() => handleImageFlip(item.id)}
            isFromProfile={isFromProfile}
            onLongPress={() => {
              if (isFromProfile) {
                setIsImageDeleteMode(!isImageDeleteMode);
              }
            }}
          />
        </View>
      );
    } else if (item.type === 'note') {
      return (
        <TouchableWithoutFeedback
          onLongPress={() => {
            if (isFromProfile) {
              setIsImageDeleteMode(!isImageDeleteMode);
            }
          }}
        >
          <View style={styles.textItemWrapper}>
            <Text style={styles.noteText}>{item.content}</Text>
            {isImageDeleteMode && (
              <TouchableOpacity
                style={styles.deleteTextButton}
                onPress={() => handleDeleteItem(item)}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableWithoutFeedback>
      );
    } else if (item.type === 'itinerary') {
      const days = item.content.split('\n'); // Split on single newline
      
      return (
        <TouchableWithoutFeedback
          onLongPress={() => {
            if (isFromProfile) {
              setIsImageDeleteMode(!isImageDeleteMode);
            }
          }}
        >
          <View style={styles.textItemWrapper}>
            <View style={styles.itineraryHeader}>
              <Ionicons name="map-outline" size={20} color="black" />
            </View>
            {days.map((day, index) => (
              <View key={index} style={styles.dayWrapper}>
                <Text style={styles.itineraryText}>{day}</Text>
              </View>
            ))}
            {isImageDeleteMode && (
              <TouchableOpacity
                style={styles.deleteTextButton}
                onPress={() => handleDeleteItem(item)}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableWithoutFeedback>
      );
    }
    return null;
  };

  useEffect(() => {
    if (isFromProfile) {
      navigation.setOptions({
        headerRight: () => isImageDeleteMode ? (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsImageDeleteMode(false)}
          >
            <Text style={styles.headerButtonText}>Done</Text>
          </TouchableOpacity>
        ) : null
      });
    }
  }, [isImageDeleteMode]);

  useEffect(() => {
    if (journal.items) {
      setItems(journal.items);
    }
  }, [journal]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={[
          styles.headerContent,
          isFromProfile && styles.headerContentWithButtons
        ]}>
          <Text style={styles.title}>{journal.title}</Text>
          <Text style={styles.date}>
            {new Date(journal.date).toLocaleDateString()}
          </Text>
          <Text style={styles.description}>{journal.description}</Text>
        </View>
        
        {isFromProfile && (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowOptions(!showOptions)}
            >
              <Ionicons 
                name={showOptions ? "close" : "add"} 
                size={24} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteJournal}
            >
              <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {showOptions && isFromProfile && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setShowNoteModal(true)}
            >
              <Ionicons name="document-text" size={24} color="#FFFFFF" />
              <Text style={styles.optionText}>Add Note</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setShowItineraryModal(true)}
            >
              <Ionicons name="map" size={24} color="#FFFFFF" />
              <Text style={styles.optionText}>Add Itinerary</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleAddPhoto}
            >
              <Ionicons name="camera" size={24} color="#FFFFFF" />
              <Text style={styles.optionText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemsList}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

      {/* Note Modal */}
      <Modal
        visible={showNoteModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.topModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Note</Text>
              <TouchableOpacity 
                onPress={() => {
                  setNoteText('');
                  setShowNoteModal(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              multiline
              placeholder="Enter your note..."
              placeholderTextColor="#666666"
              value={noteText}
              onChangeText={setNoteText}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddNote}
            >
              <Text style={styles.submitButtonText}>Add Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Itinerary Modal */}
      <Modal
        visible={showItineraryModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.topModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Itinerary</Text>
              <TouchableOpacity 
                onPress={() => {
                  setItineraryDays([]);
                  setShowItineraryModal(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={itineraryDays}
              keyExtractor={(item, index) => index.toString()}
              ListHeaderComponent={
                <TouchableOpacity
                  style={styles.addDayButton}
                  onPress={() => {
                    const newDayIndex = itineraryDays.length;
                    setItineraryDays(prev => [...prev, {
                      date: selectedDate.toLocaleDateString(),
                      activities: [{
                        name: '',
                        time: '',
                        location: ''
                      }]
                    }]);
                    setExpandedDay(newDayIndex);
                    setExpandedActivity({ day: newDayIndex, activity: 0 });
                  }}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.addDayButtonText}>Add Day</Text>
                </TouchableOpacity>
              }
              renderItem={({ item: day, index: dayIndex }) => (
                <View style={styles.dayContainer}>
                  <TouchableOpacity
                    style={styles.dayHeader}
                    onPress={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
                  >
                    <View style={styles.dayHeaderContent}>
                      <Text style={styles.dateText}>Day {dayIndex + 1}: {day.date}</Text>
                      <Text style={styles.activityCount}>
                        {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'}
                      </Text>
                    </View>
                    <Ionicons 
                      name={expandedDay === dayIndex ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  </TouchableOpacity>

                  {expandedDay === dayIndex && (
                    <View style={styles.dayContent}>
                      {renderDateSelector(day, dayIndex)}

                      {day.activities.map((activity, activityIndex) => (
                        <View key={activityIndex}>
                          <TouchableOpacity
                            style={styles.activityHeader}
                            onPress={() => {
                              const isCurrentlyExpanded = 
                                expandedActivity?.day === dayIndex && 
                                expandedActivity?.activity === activityIndex;
                              
                              setExpandedActivity(isCurrentlyExpanded ? null : {
                                day: dayIndex,
                                activity: activityIndex
                              });
                            }}
                          >
                            <Text style={styles.activityTitle}>
                              {activity.name || `Activity ${activityIndex + 1}`}
                            </Text>
                            <Ionicons 
                              name={expandedActivity?.day === dayIndex && 
                                    expandedActivity?.activity === activityIndex 
                                    ? "chevron-up" : "chevron-down"} 
                              size={20} 
                              color="#FFFFFF" 
                            />
                          </TouchableOpacity>

                          {expandedActivity?.day === dayIndex && 
                           expandedActivity?.activity === activityIndex && (
                            <View style={styles.activityContainer}>
                              <TextInput
                                style={styles.activityInput}
                                placeholder="Activity Name"
                                placeholderTextColor="#666666"
                                value={activity.name}
                                onChangeText={(text) => {
                                  const updatedDays = [...itineraryDays];
                                  updatedDays[dayIndex].activities[activityIndex].name = text;
                                  setItineraryDays(updatedDays);
                                }}
                              />
                              <TextInput
                                style={styles.activityInput}
                                placeholder="Time (optional)"
                                placeholderTextColor="#666666"
                                value={activity.time}
                                onChangeText={(text) => {
                                  const updatedDays = [...itineraryDays];
                                  updatedDays[dayIndex].activities[activityIndex].time = text;
                                  setItineraryDays(updatedDays);
                                }}
                              />
                              <TextInput
                                style={styles.activityInput}
                                placeholder="Location (optional)"
                                placeholderTextColor="#666666"
                                value={activity.location}
                                onChangeText={(text) => {
                                  const updatedDays = [...itineraryDays];
                                  updatedDays[dayIndex].activities[activityIndex].location = text;
                                  setItineraryDays(updatedDays);
                                }}
                              />
                            </View>
                          )}
                        </View>
                      ))}

                      <TouchableOpacity
                        style={styles.addActivityButton}
                        onPress={() => {
                          const updatedDays = [...itineraryDays];
                          const newActivityIndex = updatedDays[dayIndex].activities.length;
                          updatedDays[dayIndex].activities.push({
                            name: '',
                            time: '',
                            location: ''
                          });
                          setItineraryDays(updatedDays);
                          setExpandedActivity({ day: dayIndex, activity: newActivityIndex });
                        }}
                      >
                        <Ionicons name="add-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.addActivityButtonText}>Add Activity</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                const formattedText = formatItineraryAsText(itineraryDays);
                handleAddItinerary(formattedText);
              }}
            >
              <Text style={styles.submitButtonText}>Save Itinerary</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Image Details</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowEditModal(false);
                  setEditingImage(null);
                  setShowEditDatePicker(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.editFieldsContainer}>
              <View style={styles.editField}>
                <Text style={styles.editFieldLabel}>Caption</Text>
                <TextInput
                  style={styles.editInput}
                  placeholder="3 words max"
                  placeholderTextColor="#666666"
                  value={editingCaption}
                  onChangeText={handleCaptionChange}
                />
              </View>

              <View style={styles.editField}>
                <Text style={styles.editFieldLabel}>Location</Text>
                <TextInput
                  style={styles.editInput}
                  placeholder="Enter location"
                  placeholderTextColor="#666666"
                  value={editingLocation}
                  onChangeText={setEditingLocation}
                />
              </View>

              <View style={styles.editField}>
                <Text style={styles.editFieldLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => setShowEditDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {editingDate ? new Date(editingDate).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric'
                    }) : 'Select Date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {showEditDatePicker && (
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={editingDate ? new Date(editingDate) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, date) => {
                        setShowEditDatePicker(Platform.OS === 'ios');
                        if (date) {
                          setEditingDate(date.toISOString());
                        }
                        if (Platform.OS === 'android') {
                          setShowEditDatePicker(false);
                        }
                      }}
                      style={styles.datePickerStyle}
                      textColor="#FFFFFF"
                      themeVariant="dark"
                      minimumDate={MINIMUM_DATE}
                      maximumDate={MAXIMUM_DATE}
                    />
                    {Platform.OS === 'ios' && (
                      <TouchableOpacity
                        style={styles.datePickerDoneButton}
                        onPress={() => setShowEditDatePicker(false)}
                      >
                        <Text style={styles.datePickerDoneButtonText}>Done</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSaveImageEdit}
            >
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  headerContent: {
    marginBottom: 0,
  },
  headerContentWithButtons: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    fontFamily: 'Inter_400Regular',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
  },
  optionsContainer: {
    marginTop: 10,
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  optionText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  itemsList: {
    padding: 15,
  },
  itemContainer: {
    position: 'relative',
    marginBottom: 25,
  },
  itemSeparator: {
    height: 25,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    marginVertical: 10,
    padding: 30,
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 0,
  },
  deleteImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 2,
  },
  deleteX: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  noteContainer: {
    backgroundColor: '#111111',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  noteText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Courier',
    lineHeight: 24,
  },
  itineraryContainer: {
    backgroundColor: '#111111',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  itineraryText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Courier',
    lineHeight: 20,
    whiteSpace: 'pre',
    paddingHorizontal: 10,
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
  modalInput: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 15,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    height: 150,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  dayContainer: {
    backgroundColor: '#222222',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#333333',
  },
  dayHeaderContent: {
    flex: 1,
  },
  dayContent: {
    padding: 15,
  },
  activityCount: {
    color: '#888888',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  activityContainer: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  activityInput: {
    backgroundColor: '#444444',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  addDayButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    marginLeft: 8,
  },
  addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 10,
  },
  addActivityButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginLeft: 8,
  },
  deleteIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    marginRight: 15,
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  textItemWrapper: {
    position: 'relative',
    width: '100%',
    marginVertical: 10,
    padding: 30,
    backgroundColor: 'white',
  },
  deleteTextButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 2,
  },
  itineraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  itineraryDate: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Courier',
    marginLeft: 10,
  },
  editModalContent: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 20,
    marginTop: 50,
    margin: 20,
    maxHeight: '80%',
  },
  editFieldsContainer: {
    marginVertical: 10,
  },
  editField: {
    marginBottom: 15,
  },
  editFieldLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginBottom: 5,
  },
  editInput: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 10,
    height: 40,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  dayWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#000000',
    width: '100%',
    alignSelf: 'center',
    marginBottom: 10,
    opacity: 0.2,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  iosDatePicker: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  datePickerContainer: {
    backgroundColor: '#222222',
    borderRadius: 8,
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  datePickerStyle: {
    width: Platform.OS === 'ios' ? '100%' : undefined,
    height: Platform.OS === 'ios' ? 200 : undefined,
    backgroundColor: '#222222',
  },
  datePickerDoneButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#333333',
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  datePickerDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
});

export default JournalDetailScreen; 