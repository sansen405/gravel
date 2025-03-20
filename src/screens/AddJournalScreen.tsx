import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { colors } from '../theme/colors';
import { TravelJournal } from '../types';
import ImagePickerButton from '../components/ImagePickerButton';
import { cities, countries } from '../data/cities';

export default function AddJournalScreen() {
  const navigation = useNavigation();
  const [coverImage, setCoverImage] = useState('');

  // City dropdown state
  const [cityOpen, setCityOpen] = useState(false);
  const [cityValue, setCityValue] = useState(null);
  const [cityItems, setCityItems] = useState(cities);
  const [searchableCity, setSearchableCity] = useState('');

  // Country dropdown state
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryValue, setCountryValue] = useState(null);
  const [countryItems, setCountryItems] = useState(
    countries.map(country => ({ label: country, value: country }))
  );

  // Handle dropdown open states
  const onCityOpen = useCallback(() => {
    setCountryOpen(false);
  }, []);

  const onCountryOpen = useCallback(() => {
    setCityOpen(false);
  }, []);

  // Filter cities when country is selected
  const filterCitiesByCountry = useCallback((selectedCountry: string) => {
    const filteredCities = cities.filter(city => city.country === selectedCountry);
    setCityItems(filteredCities);
    setCityValue(null);
  }, []);

  const handleCreate = () => {
    if (!cityValue || !countryValue || !coverImage) {
      Alert.alert('Missing Fields', 'Please fill in all fields and select a cover image');
      return;
    }

    const selectedCity = cities.find(city => city.value === cityValue);

    const newJournal: TravelJournal = {
      id: Date.now().toString(),
      city: selectedCity?.value || '',
      country: countryValue,
      coverImage,
      dateCreated: new Date().toISOString(),
      entries: [],
    };

    // TODO: Add to actual data storage
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Cover Image</Text>
        <ImagePickerButton
          onImagePicked={setCoverImage}
          existingImage={coverImage}
        />

        <Text style={styles.label}>Country</Text>
        <DropDownPicker
          open={countryOpen}
          value={countryValue}
          items={countryItems}
          setOpen={setCountryOpen}
          setValue={setCountryValue}
          setItems={setCountryItems}
          onOpen={onCountryOpen}
          searchable={true}
          searchPlaceholder="Search for a country..."
          placeholder="Select a country"
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          onChangeValue={(value) => {
            if (value) filterCitiesByCountry(value);
          }}
          zIndex={3000}
        />

        <Text style={[styles.label, { marginTop: 20 }]}>City</Text>
        <DropDownPicker
          open={cityOpen}
          value={cityValue}
          items={cityItems}
          setOpen={setCityOpen}
          setValue={setCityValue}
          setItems={setCityItems}
          onOpen={onCityOpen}
          searchable={true}
          searchPlaceholder="Search for a city..."
          placeholder="Select a city"
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          disabled={!countryValue}
          disabledStyle={styles.dropdownDisabled}
          zIndex={2000}
        />

        <TouchableOpacity 
          style={[styles.button, { marginTop: 40 }]} 
          onPress={handleCreate}
        >
          <Text style={styles.buttonText}>Create Journal</Text>
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
  dropdown: {
    backgroundColor: colors.white,
    borderWidth: 0,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  dropdownDisabled: {
    opacity: 0.5,
    backgroundColor: colors.lightGray,
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