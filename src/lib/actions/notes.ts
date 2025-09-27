"use server";

import { db } from "@/lib/db";
import { notes, quotes } from "@/lib/db/schema";
import { eq, and, or, ilike } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { Note, Quote } from "@/types";

export async function createNote(
  bookId: string,
  title: string,
  content: string,
  chapter?: string,
  section?: string,
  tags: string[] = [],
) {
  const user = await requireAuth();

  try {
    const newNote = await db
      .insert(notes)
      .values({
        user_id: user.id,
        book_id: bookId,
        title,
        content,
        chapter,
        section,
        tags,
      })
      .returning();

    return newNote[0];
  } catch (error) {
    console.error("Error creating note:", error);
    throw new Error("Failed to create note");
  }
}

export async function updateNote(
  noteId: string,
  title: string,
  content: string,
  chapter?: string,
  section?: string,
  tags: string[] = [],
) {
  const user = await requireAuth();

  try {
    const updatedNote = await db
      .update(notes)
      .set({
        title,
        content,
        chapter,
        section,
        tags,
        updated_at: new Date(),
      })
      .where(and(eq(notes.id, noteId), eq(notes.user_id, user.id)))
      .returning();

    return updatedNote[0];
  } catch (error) {
    console.error("Error updating note:", error);
    throw new Error("Failed to update note");
  }
}

export async function deleteNote(noteId: string) {
  const user = await requireAuth();

  try {
    // Delete associated quotes first
    await db.delete(quotes).where(eq(quotes.note_id, noteId));

    // Delete the note
    await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.user_id, user.id)));

    return { success: true };
  } catch (error) {
    console.error("Error deleting note:", error);
    throw new Error("Failed to delete note");
  }
}

export async function getBookNotes(bookId: string) {
  const user = await requireAuth();

  try {
    const bookNotes = await db
      .select()
      .from(notes)
      .where(and(eq(notes.user_id, user.id), eq(notes.book_id, bookId)))
      .orderBy(notes.created_at);

    return bookNotes;
  } catch (error) {
    console.error("Error fetching book notes:", error);
    throw new Error("Failed to fetch book notes");
  }
}

export async function getAllUserNotes() {
  const user = await requireAuth();

  try {
    const userNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.user_id, user.id))
      .orderBy(notes.updated_at);

    return userNotes;
  } catch (error) {
    console.error("Error fetching user notes:", error);
    throw new Error("Failed to fetch user notes");
  }
}

export async function searchNotes(
  query: string,
  filters?: {
    tags?: string[];
    chapter?: string;
    bookId?: string;
  },
) {
  const user = await requireAuth();

  try {
    const conditions = [eq(notes.user_id, user.id)];

    // Add search query filter
    if (query.trim()) {
      conditions.push(
        or(
          ilike(notes.title, `%${query}%`),
          ilike(notes.content, `%${query}%`),
        )!,
      );
    }

    // Add additional filters
    if (filters?.bookId) {
      conditions.push(eq(notes.book_id, filters.bookId));
    }

    if (filters?.chapter) {
      conditions.push(eq(notes.chapter, filters.chapter));
    }

    // TODO: Add tag filtering when needed

    const searchResults = await db
      .select()
      .from(notes)
      .where(and(...conditions))
      .orderBy(notes.updated_at);

    return searchResults;
  } catch (error) {
    console.error("Error searching notes:", error);
    throw new Error("Failed to search notes");
  }
}

export async function addQuote(
  noteId: string,
  text: string,
  pageNumber?: number,
) {
  const user = await requireAuth();

  try {
    // Verify the note belongs to the user
    const note = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.user_id, user.id)))
      .limit(1);

    if (note.length === 0) {
      throw new Error("Note not found or access denied");
    }

    const newQuote = await db
      .insert(quotes)
      .values({
        note_id: noteId,
        text,
        page_number: pageNumber,
      })
      .returning();

    return newQuote[0];
  } catch (error) {
    console.error("Error adding quote:", error);
    throw new Error("Failed to add quote");
  }
}

export async function getNoteQuotes(noteId: string) {
  const user = await requireAuth();

  try {
    // Verify the note belongs to the user
    const note = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.user_id, user.id)))
      .limit(1);

    if (note.length === 0) {
      throw new Error("Note not found or access denied");
    }

    const noteQuotes = await db
      .select()
      .from(quotes)
      .where(eq(quotes.note_id, noteId))
      .orderBy(quotes.created_at);

    return noteQuotes;
  } catch (error) {
    console.error("Error fetching note quotes:", error);
    throw new Error("Failed to fetch note quotes");
  }
}

export async function deleteQuote(quoteId: string) {
  const user = await requireAuth();

  try {
    // Verify the quote belongs to a note owned by the user
    const quoteWithNote = await db
      .select({
        quote: quotes,
        note: notes,
      })
      .from(quotes)
      .innerJoin(notes, eq(quotes.note_id, notes.id))
      .where(and(eq(quotes.id, quoteId), eq(notes.user_id, user.id)))
      .limit(1);

    if (quoteWithNote.length === 0) {
      throw new Error("Quote not found or access denied");
    }

    await db.delete(quotes).where(eq(quotes.id, quoteId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting quote:", error);
    throw new Error("Failed to delete quote");
  }
}
