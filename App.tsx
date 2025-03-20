import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TravelJournal } from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import JournalScreen from './src/screens/JournalScreen';
import AddJournalScreen from './src/screens/AddJournalScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';
import { colors } from './src/theme/colors';

type RootStackParamList = {
  Home: undefined;
  Journal: {
    id: string;
    city: string;
    journal: TravelJournal;
  };
  AddJournal: undefined;
  AddEntry: {
    journalId: string;
    onAddEntry: (entry: any) => void;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Travel Journal' }}
        />
        <Stack.Screen 
          name="Journal" 
          component={JournalScreen}
          options={({ route }) => ({ 
            title: `${route.params.city}`,
            headerBackTitle: 'Back'
          })}
        />
        <Stack.Screen 
          name="AddJournal" 
          component={AddJournalScreen}
          options={{ 
            title: 'New Journal',
            presentation: 'modal',
          }}
        />
        <Stack.Screen 
          name="AddEntry" 
          component={AddEntryScreen}
          options={{ 
            title: 'Add Entry',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
