import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://fnjqcmotojbofcsjfsut.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuanFjbW90b2pib2Zjc2pmc3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjA5MDcsImV4cCI6MjA1OTczNjkwN30.2my6ZCzgFDebj0f2WCua3R-m7evch7WvijNjokeEgRk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 