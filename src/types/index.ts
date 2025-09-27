// Core book type from Google Books API
export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    publisher?: string;
    pageCount?: number;
    categories?: string[];
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
}

// Simplified book type for our database
export interface Book {
  id: string;
  title: string;
  authors: string[];
  description?: string | null;
  cover_url?: string | null;
  published_date?: string | null;
  publisher?: string | null;
  page_count?: number | null;
  categories?: string[] | null;
  language?: string | null;
  preview_link?: string | null;
  info_link?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

// User book list types
export type BookListType = 'to-read' | 'reading' | 'completed';

export interface UserBook {
  id: string;
  user_id: string;
  book_id: string;
  list_type: BookListType;
  added_at: string | Date;
  book?: Book;
  user_rating?: number | null;
}

// Review and rating types
export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  rating: number; // 1-5 stars
  review_text?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  book?: Book;
}

// Notes system types
export interface Note {
  id: string;
  user_id: string;
  book_id: string;
  title: string;
  content: string; // Rich text content from React Quill
  chapter?: string | null;
  section?: string | null;
  tags: string[];
  created_at: string | Date;
  updated_at: string | Date;
  book?: Book;
}

export interface Quote {
  id: string;
  note_id: string;
  text: string;
  page_number?: number;
  created_at: string;
}

// Search and filter types
export interface BookSearchFilters {
  query?: string;
  category?: string;
  author?: string;
  publishedYear?: number;
  language?: string;
}

export interface NoteSearchFilters {
  query?: string;
  tags?: string[];
  chapter?: string;
  bookId?: string;
}

// Form types
export interface BookSearchFormData {
  query: string;
}

export interface ReviewFormData {
  rating: number;
  review_text?: string;
}

export interface NoteFormData {
  title: string;
  content: string;
  chapter?: string;
  section?: string;
  tags: string[];
}

// API response types
export interface GoogleBooksResponse {
  items: GoogleBook[];
  totalItems: number;
}

// User authentication types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Export/Import types
export interface NotesExport {
  book: Book;
  notes: Note[];
  quotes: Quote[];
  exportDate: string;
}

// Component props types
export interface BookCardProps {
  book: Book;
  showActions?: boolean;
  onAddToList?: (book: Book, listType: BookListType) => void;
  onRemoveFromList?: (bookId: string) => void;
  currentListType?: BookListType;
  userRating?: number;
  addedAt?: string | Date;
}

export interface NotesEditorProps {
  book: Book;
  initialNotes?: Note[];
  onSave?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
}
