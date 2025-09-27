import axios from 'axios';
import { GoogleBook, GoogleBooksResponse } from '@/types';

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1/volumes';

export async function searchBooks(query: string, maxResults: number = 20): Promise<GoogleBook[]> {
  if (!process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY) {
    throw new Error('Google Books API key is not configured');
  }

  const params = new URLSearchParams({
    q: query,
    maxResults: maxResults.toString(),
    key: process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY,
  });

  console.log(`${GOOGLE_BOOKS_API_BASE}?${params}`);

  try {
    const response = await axios.get<GoogleBooksResponse>(`${GOOGLE_BOOKS_API_BASE}?${params}`);
    return response.data.items || [];
  } catch (error) {
    console.error('Error searching books:', error);
    throw new Error('Failed to search books');
  }
}

export async function getBookById(bookId: string): Promise<GoogleBook | null> {
  if (!process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY) {
    throw new Error('Google Books API key is not configured');
  }

  try {
    const response = await axios.get<GoogleBook>(`${GOOGLE_BOOKS_API_BASE}/${bookId}?key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching book:', error);
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch book details');
  }
}

export function transformGoogleBookToBook(googleBook: GoogleBook) {
  const { id, volumeInfo } = googleBook;

  return {
    id,
    title: volumeInfo.title,
    authors: volumeInfo.authors || [],
    description: volumeInfo.description,
    cover_url: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
    published_date: volumeInfo.publishedDate,
    publisher: volumeInfo.publisher,
    page_count: volumeInfo.pageCount,
    categories: volumeInfo.categories,
    language: volumeInfo.language,
    preview_link: volumeInfo.previewLink,
    info_link: volumeInfo.infoLink,
    created_at: new Date(),
    updated_at: new Date(),
  };
}
