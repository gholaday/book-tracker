import { useState } from 'react';
import { Book, BookListType } from '@/types';
import { addBookToList, removeBookFromList, addReview } from '@/lib/actions/books';
import { useToast } from '@/components/ui/toaster';

export function useBookActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleAddToList = async (book: Book, listType: BookListType, onSuccess?: (book: Book, listType: BookListType) => void) => {
    setIsLoading(true);
    try {
      await addBookToList(book.id, listType);
      onSuccess?.(book, listType);

      const listTypeText = listType === 'to-read' ? 'Want to Read' : listType === 'reading' ? 'Reading' : 'Completed';

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
      setIsLoading(false);
    }
  };

  const handleRemoveFromList = async (bookId: string, bookTitle: string, onSuccess?: (bookId: string) => void) => {
    setIsLoading(true);
    try {
      await removeBookFromList(bookId);
      onSuccess?.(bookId);

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
      setIsLoading(false);
    }
  };

  const handleRatingChange = async (book: Book, rating: number, onSuccess?: (rating: number) => void) => {
    try {
      await addReview(book.id, rating, '');
      onSuccess?.(rating);

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
  };

  return {
    isLoading,
    handleAddToList,
    handleRemoveFromList,
    handleRatingChange,
  };
}
