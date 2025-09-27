import { pgTable, text, varchar, integer, timestamp, boolean, json, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Books table
export const books = pgTable('books', {
  id: text('id').primaryKey(), // Google Books ID
  title: text('title').notNull(),
  authors: json('authors').$type<string[]>().notNull(),
  description: text('description'),
  cover_url: text('cover_url'),
  published_date: text('published_date'),
  publisher: text('publisher'),
  page_count: integer('page_count'),
  categories: json('categories').$type<string[]>(),
  language: text('language'),
  preview_link: text('preview_link'),
  info_link: text('info_link'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// User books (for tracking books in lists)
export const userBooks = pgTable('user_books', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  book_id: text('book_id')
    .notNull()
    .references(() => books.id),
  list_type: text('list_type', { enum: ['to-read', 'reading', 'completed'] }).notNull(),
  added_at: timestamp('added_at').defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  book_id: text('book_id')
    .notNull()
    .references(() => books.id),
  rating: integer('rating').notNull(), // 1-5 stars
  review_text: text('review_text'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Notes table
export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  book_id: text('book_id')
    .notNull()
    .references(() => books.id),
  title: text('title').notNull(),
  content: text('content').notNull(), // Rich text content
  chapter: text('chapter'),
  section: text('section'),
  tags: json('tags').$type<string[]>().default([]).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Quotes table (for highlighting quotes within notes)
export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  note_id: uuid('note_id')
    .notNull()
    .references(() => notes.id),
  text: text('text').notNull(),
  page_number: integer('page_number'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const booksRelations = relations(books, ({ many }) => ({
  userBooks: many(userBooks),
  reviews: many(reviews),
  notes: many(notes),
}));

export const userBooksRelations = relations(userBooks, ({ one }) => ({
  book: one(books, {
    fields: [userBooks.book_id],
    references: [books.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  book: one(books, {
    fields: [reviews.book_id],
    references: [books.id],
  }),
}));

export const notesRelations = relations(notes, ({ one, many }) => ({
  book: one(books, {
    fields: [notes.book_id],
    references: [books.id],
  }),
  quotes: many(quotes),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  note: one(notes, {
    fields: [quotes.note_id],
    references: [notes.id],
  }),
}));
