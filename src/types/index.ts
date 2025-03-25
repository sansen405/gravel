export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  profileImage?: string;
  followers: string[];
  following: string[];
  journalCount: number;
  createdAt: string;
}

export interface TravelJournal {
  id: string;
  userId: string;
  username: string;
  userProfileImage?: string;
  city: string;
  country: string;
  dateCreated: string;
  coverImage: string;
  description?: string;
  isPublic: boolean;
  likes: string[];
  comments: Comment[];
  entries: JournalEntry[];
  tags: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface JournalEntry {
  id: string;
  image: string;
  caption: string;
  date: string;
  location?: string;
  tags: string[];
  likes: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userProfileImage?: string;
  text: string;
  createdAt: string;
  likes: string[];
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  fromUserId: string;
  fromUsername: string;
  fromUserProfileImage?: string;
  toUserId: string;
  journalId?: string;
  commentId?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: { userId: string };
  EditProfile: undefined;
  Journal: {
    id: string;
    city: string;
    journal: TravelJournal;
  };
  AddJournal: {
    selectedImage?: string;
  };
  Search: undefined;
  Notifications: undefined;
  Comments: {
    journalId: string;
    entryId?: string;
  };
  Followers: { userId: string };
  Following: { userId: string };
  Settings: undefined;
}; 