export interface TravelJournal {
  id: string;
  city: string;
  country: string;
  coverImage: string;
  dateCreated: string;
  entries: JournalEntry[];
}

export interface JournalEntry {
  id: string;
  image: string;
  caption: string;
  date: string;
  location?: string;
} 