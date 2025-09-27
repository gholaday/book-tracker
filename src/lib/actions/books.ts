'use server';

import { db } from '@/lib/db';
import { books, userBooks, reviews } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { getBookById, searchBooks, transformGoogleBookToBook } from '@/lib/google-books';
import { BookListType } from '@/types';

export async function searchBooksAction(query: string) {
  if (!query.trim()) {
    return [];
  }

  try {
    const googleBooks = await searchBooks(query);
    return googleBooks.map(transformGoogleBookToBook);
  } catch (error) {
    console.error('Error searching books:', error);
    throw new Error('Failed to search books');
  }
}

export async function addBookToList(bookId: string, listType: BookListType) {
  const user = await requireAuth();

  try {
    // Check if book exists in our database
    const existingBook = await db.select().from(books).where(eq(books.id, bookId)).limit(1);

    if (existingBook.length === 0) {
      // Get book details from Google Books API and save to database
      const googleBook = await getBookById(bookId);
      if (!googleBook) {
        throw new Error('Book not found');
      }

      const bookData = transformGoogleBookToBook(googleBook);
      await db.insert(books).values(bookData);
    }

    // Check if user already has this book in any list
    const existingUserBook = await db
      .select()
      .from(userBooks)
      .where(and(eq(userBooks.user_id, user.id), eq(userBooks.book_id, bookId)))
      .limit(1);

    if (existingUserBook.length > 0) {
      // Update existing entry
      await db.update(userBooks).set({ list_type: listType }).where(eq(userBooks.id, existingUserBook[0].id));
    } else {
      // Add new entry
      await db.insert(userBooks).values({
        user_id: user.id,
        book_id: bookId,
        list_type: listType,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding book to list:', error);
    throw new Error('Failed to add book to list');
  }
}

export async function removeBookFromList(bookId: string) {
  const user = await requireAuth();

  try {
    await db.delete(userBooks).where(and(eq(userBooks.user_id, user.id), eq(userBooks.book_id, bookId)));

    return { success: true };
  } catch (error) {
    console.error('Error removing book from list:', error);
    throw new Error('Failed to remove book from list');
  }
}

export async function getUserBooks(listType?: BookListType) {
  const user = await requireAuth();

  try {
    const userBooksList = await db
      .select({
        id: userBooks.id,
        user_id: userBooks.user_id,
        book_id: userBooks.book_id,
        list_type: userBooks.list_type,
        added_at: userBooks.added_at,
        book: books,
        user_rating: reviews.rating,
      })
      .from(userBooks)
      .innerJoin(books, eq(userBooks.book_id, books.id))
      .leftJoin(reviews, and(eq(reviews.book_id, userBooks.book_id), eq(reviews.user_id, user.id)))
      .where(listType ? and(eq(userBooks.user_id, user.id), eq(userBooks.list_type, listType)) : eq(userBooks.user_id, user.id));

    return userBooksList;
  } catch (error) {
    console.error('Error fetching user books:', error);
    throw new Error('Failed to fetch user books');
  }
}

export async function getBookDetails(bookId: string) {
  await requireAuth();

  try {
    // First, try to get the book from our database
    const book = await db.select().from(books).where(eq(books.id, bookId)).limit(1);

    if (book[0]) {
      return book[0];
    }

    // If not found locally, try to fetch from Google Books API
    const { getBookById, transformGoogleBookToBook } = await import('@/lib/google-books');
    const googleBook = await getBookById(bookId);

    if (googleBook) {
      // Transform and save to database for future use
      const bookData = transformGoogleBookToBook(googleBook);
      await db.insert(books).values(bookData);
      return bookData;
    }

    return null;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw new Error('Failed to fetch book details');
  }
}

export async function addReview(bookId: string, rating: number, reviewText?: string) {
  const user = await requireAuth();

  try {
    // Check if user already has a review for this book
    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.user_id, user.id), eq(reviews.book_id, bookId)))
      .limit(1);

    if (existingReview.length > 0) {
      // Update existing review
      await db
        .update(reviews)
        .set({
          rating,
          review_text: reviewText,
          updated_at: new Date(),
        })
        .where(eq(reviews.id, existingReview[0].id));
    } else {
      // Add new review
      await db.insert(reviews).values({
        user_id: user.id,
        book_id: bookId,
        rating,
        review_text: reviewText,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding review:', error);
    throw new Error('Failed to add review');
  }
}

export async function getBookReviews(bookId: string) {
  await requireAuth();

  try {
    const bookReviews = await db.select().from(reviews).where(eq(reviews.book_id, bookId));

    return bookReviews;
  } catch (error) {
    console.error('Error fetching book reviews:', error);
    throw new Error('Failed to fetch book reviews');
  }
}
