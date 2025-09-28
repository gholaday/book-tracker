"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { Book, BookListType, UserBook, Review, Note } from '@/types';
import { useToast } from '@/components/ui/toaster';
import {
  addBookToList,
  removeBookFromList,
  addReview,
  getUserBooks
} from '@/lib/actions/books';

interface BookContextType {
  // State
  allBooks: UserBook[];
  isLoading: boolean;
  isActionLoading: boolean;
  currentBook: Book | null;
  currentListType: BookListType | null;
  userRating: number;
  addedAt: string | Date | null;

  // Actions
  loadUserBooks: (showLoading?: boolean) => Promise<void>;
  addBookToList: (book: Book, listType: BookListType) => Promise<void>;
  removeBookFromList: (bookId: string) => Promise<void>;
  changeBookStatus: (book: Book, newStatus: BookListType) => Promise<void>;
  updateBookRating: (book: Book, rating: number) => Promise<void>;
  setCurrentBook: (book: Book | null) => void;
  setCurrentListType: (listType: BookListType | null) => void;
  setUserRating: (rating: number) => void;
  setAddedAt: (date: string | Date | null) => void;

  // Computed values
  toReadBooks: UserBook[];
  readingBooks: UserBook[];
  completedBooks: UserBook[];
  getBookById: (bookId: string) => UserBook | undefined;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

interface BookProviderProps {
  children: ReactNode;
}

export function BookProvider({ children }: BookProviderProps) {
  const [allBooks, setAllBooks] = useState<UserBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentListType, setCurrentListType] = useState<BookListType | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [addedAt, setAddedAt] = useState<string | Date | null>(null);

  const { addToast } = useToast();

  // Load all user books
  const loadUserBooks = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const userBooks = await getUserBooks();
      setAllBooks(userBooks);
    } catch (error) {
      console.error('Error loading user books:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load your books. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const refreshBooks = useCallback(async () => {
    try {
      const userBooks = await getUserBooks();
      setAllBooks(userBooks);
    } catch (error) {
      console.error('Error loading user books:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load your books. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [addToast]);

  // Add book to list
  const handleAddBookToList = useCallback(async (book: Book, listType: BookListType) => {
    setIsActionLoading(true);
    try {
      await addBookToList(book.id, listType);

      // Reload books to get updated state
      await refreshBooks();

      const listTypeText = listType === 'to-read' ? 'Want to Read' :
        listType === 'reading' ? 'Reading' : 'Completed';

      addToast({
        title: 'Book Added',
        description: `${book.title} has been added to your ${listTypeText} list`,
        variant: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error adding book to list:', error);
      addToast({
        title: 'Error',
        description: 'Failed to add book to list. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsActionLoading(false);
    }
  }, [refreshBooks, addToast]);

  // Remove book from list
  const handleRemoveBookFromList = useCallback(async (bookId: string) => {
    setIsActionLoading(true);
    try {
      const bookToRemove = allBooks.find(ub => ub.book_id === bookId);
      const bookTitle = bookToRemove?.book?.title || 'Book';

      await removeBookFromList(bookId);

      // Update local state immediately
      setAllBooks(prev => prev.filter(ub => ub.book_id !== bookId));

      addToast({
        title: 'Book Removed',
        description: `${bookTitle} has been removed from your list`,
        variant: 'default',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error removing book from list:', error);
      addToast({
        title: 'Error',
        description: 'Failed to remove book from list. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsActionLoading(false);
    }
  }, [allBooks, addToast]);

  // Change book status
  const handleChangeBookStatus = useCallback(async (book: Book, newStatus: BookListType) => {
    const existingBook = allBooks.find(ub => ub.book_id === book.id);

    await handleAddBookToList(book, newStatus);
  }, [allBooks, handleAddBookToList]);

  // Update book rating
  const handleUpdateBookRating = useCallback(async (book: Book, rating: number) => {
    try {
      await addReview(book.id, rating, '');

      // Update local state
      setAllBooks(prev => prev.map(ub =>
        ub.book_id === book.id
          ? { ...ub, user_rating: rating }
          : ub
      ));

      addToast({
        title: 'Rating Updated',
        description: `You rated ${book.title} ${rating} star${rating > 1 ? 's' : ''}`,
        variant: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating rating:', error);
      addToast({
        title: 'Error',
        description: 'Failed to update rating. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [addToast]);

  // Get book by ID
  const getBookById = useCallback((bookId: string) => {
    return allBooks.find(ub => ub.book_id === bookId);
  }, [allBooks]);

  // Computed values
  const toReadBooks = useMemo(() => allBooks.filter(ub => ub.list_type === 'to-read'), [allBooks]);
  const readingBooks = useMemo(() => allBooks.filter(ub => ub.list_type === 'reading'), [allBooks]);
  const completedBooks = useMemo(() => allBooks.filter(ub => ub.list_type === 'completed'), [allBooks]);

  const value: BookContextType = {
    // State
    allBooks,
    isLoading,
    isActionLoading,
    currentBook,
    currentListType,
    userRating,
    addedAt,

    // Actions
    loadUserBooks,
    addBookToList: handleAddBookToList,
    removeBookFromList: handleRemoveBookFromList,
    changeBookStatus: handleChangeBookStatus,
    updateBookRating: handleUpdateBookRating,
    setCurrentBook,
    setCurrentListType,
    setUserRating,
    setAddedAt,

    // Computed values
    toReadBooks,
    readingBooks,
    completedBooks,
    getBookById,
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
}

export function useBookContext() {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBookContext must be used within a BookProvider');
  }
  return context;
}
