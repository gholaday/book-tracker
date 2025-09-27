"use client";

import { useState, useEffect } from "react";
import { Book, Review, Note, BookListType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toaster";
import BookInfo from "./BookInfo";
import { useBookActions } from "@/hooks/useBookActions";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { addBookToList, removeBookFromList, getUserBooks } from "@/lib/actions/books";
import { createNote, updateNote, deleteNote } from "@/lib/actions/notes";

interface BookDetailsProps {
  book: Book;
  reviews: Review[];
  notes: Note[];
}

export default function BookDetails({
  book,
  reviews: initialReviews,
  notes: initialNotes,
}: BookDetailsProps) {
  const router = useRouter();
  const [showNotes, setShowNotes] = useState(initialNotes.length > 0);
  const [reviews, setReviews] = useState(initialReviews);
  const [notes, setNotes] = useState(initialNotes);
  const [currentListType, setCurrentListType] = useState<BookListType | null>(null);
  const [addedAt, setAddedAt] = useState<string | Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { addToast } = useToast();
  const { handleAddToList, handleRemoveFromList, handleRatingChange } = useBookActions();

  const [userRating, setUserRating] = useState(0);

  // Note form state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteChapter, setNoteChapter] = useState("");
  const [noteTags, setNoteTags] = useState("");

  // Get user's rating from reviews
  const userReview = reviews.find(review => review.user_id);
  const userRatingValue = userReview?.rating || 0;

  // Check user's book status and rating on component mount
  useEffect(() => {
    const checkUserBookStatus = async () => {
      try {
        const userBooks = await getUserBooks();
        const userBook = userBooks.find(ub => ub.book_id === book.id);
        setCurrentListType(userBook?.list_type || null);
        setAddedAt(userBook?.added_at || null);

        // Set user rating from existing review
        if (userReview) {
          setUserRating(userReview.rating);
        }
      } catch (error) {
        console.error("Error checking user book status:", error);
      }
    };

    checkUserBookStatus();
  }, [book.id, userReview]);

  // Update userRating when userReview changes
  useEffect(() => {
    if (userReview) {
      setUserRating(userReview.rating);
    } else {
      setUserRating(0);
    }
  }, [userReview]);

  const handleAddToListWrapper = async (book: Book, listType: string) => {
    await handleAddToList(book, listType as BookListType, () => setCurrentListType(listType as BookListType));
  };

  const handleRemoveFromListWrapper = async (bookId: string) => {
    await handleRemoveFromList(bookId, book.title, () => setCurrentListType(null));
  };

  const handleRatingChangeWrapper = async (rating: number) => {
    setUserRating(rating);
    await handleRatingChange(book, rating);
  };

  const handleStatusChange = async (book: Book, newStatus: string) => {
    await handleAddToListWrapper(book, newStatus);
  };


  const handleSubmitNote = async () => {
    setIsLoading(true);
    try {
      const tags = noteTags.split(",").map(tag => tag.trim()).filter(Boolean);

      if (editingNote) {
        await updateNote(editingNote.id, noteTitle, noteContent, noteChapter, undefined, tags);
        setNotes(notes.map(note =>
          note.id === editingNote.id
            ? { ...note, title: noteTitle, content: noteContent, chapter: noteChapter, tags, updated_at: new Date() }
            : note
        ));
        setEditingNote(null);

        addToast({
          title: "Note Updated",
          description: `"${noteTitle}" has been updated`,
          variant: "success",
          duration: 3000,
        });
      } else {
        const newNote = await createNote(book.id, noteTitle, noteContent, noteChapter, undefined, tags);
        setNotes([...notes, newNote]);

        addToast({
          title: "Note Created",
          description: `"${noteTitle}" has been added to your notes`,
          variant: "success",
          duration: 3000,
        });
      }

      setNoteTitle("");
      setNoteContent("");
      setNoteChapter("");
      setNoteTags("");
      setShowNoteForm(false);
      setShowNotes(true);
    } catch (error) {
      console.error("Error submitting note:", error);
      addToast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteChapter(note.chapter || "");
    setNoteTags(note.tags.join(", "));
    setShowNoteForm(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    setIsLoading(true);
    try {
      await deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));

      addToast({
        title: "Note Deleted",
        description: "Note has been removed",
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      addToast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Book Details</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-8rem)]">
        <div className="grid lg:grid-cols-3 gap-8 h-full">
          {/* Book Info Sidebar */}
          <div className="lg:col-span-1">
            <BookInfo
              book={book}
              currentListType={currentListType}
              userRating={userRating}
              addedAt={addedAt || undefined}
              onAddToList={handleAddToListWrapper}
              onRemoveFromList={handleRemoveFromListWrapper}
              onStatusChange={handleStatusChange}
              onRatingChange={handleRatingChangeWrapper}
            />
          </div>

          {/* Main Content with Tabs */}
          <div className="lg:col-span-2 h-full">
            <Tabs defaultValue="information" className="w-full h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="information">Information</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="information" className="space-y-6 mt-6">
                {/* Description */}
                {book.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: book.description }}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="notes" className="mt-6 flex-1 flex flex-col">
                <Card id="notes" className="flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Notes ({notes.length})
                      </span>
                      <div className="flex gap-2">
                        {currentListType && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowNoteForm(!showNoteForm)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Note
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  {showNoteForm && (
                    <CardContent className="border-t pt-4">
                      <div className="space-y-4">
                        {/* Title and Chapter in a row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="note-title" className="text-sm font-medium">Title</Label>
                            <input
                              id="note-title"
                              type="text"
                              value={noteTitle}
                              onChange={(e) => setNoteTitle(e.target.value)}
                              placeholder="Note title..."
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="note-chapter" className="text-sm font-medium">Chapter (optional)</Label>
                            <input
                              id="note-chapter"
                              type="text"
                              value={noteChapter}
                              onChange={(e) => setNoteChapter(e.target.value)}
                              placeholder="e.g., Chapter 1, Introduction..."
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* Tags */}
                        <div>
                          <Label htmlFor="note-tags" className="text-sm font-medium">Tags (comma-separated)</Label>
                          <input
                            id="note-tags"
                            type="text"
                            value={noteTags}
                            onChange={(e) => setNoteTags(e.target.value)}
                            placeholder="e.g., important, quotes, analysis..."
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Content Section */}
                        <div>
                          <Label htmlFor="note-content" className="text-sm font-medium">Content</Label>
                          <div className="mt-1 border rounded-md">
                            <ReactQuill
                              value={noteContent}
                              onChange={setNoteContent}
                              placeholder="Write your notes here..."
                              modules={{
                                toolbar: [
                                  [{ header: [1, 2, 3, false] }],
                                  ["bold", "italic", "underline", "strike"],
                                  [{ color: [] }, { background: [] }],
                                  [{ list: "ordered" }, { list: "bullet" }],
                                  ["blockquote", "code-block"],
                                  ["link", "image"],
                                  ["clean"],
                                ],
                              }}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button onClick={handleSubmitNote} disabled={isLoading}>
                            {editingNote ? "Update Note" : "Create Note"}
                          </Button>
                          <Button variant="outline" onClick={() => {
                            setShowNoteForm(false);
                            setEditingNote(null);
                            setNoteTitle("");
                            setNoteContent("");
                            setNoteChapter("");
                            setNoteTags("");
                            setShowNotes(true);
                          }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                  {showNotes && !editingNote && !showNoteForm && (
                    <CardContent className="flex-1 overflow-hidden flex flex-col">
                      {notes.length > 0 ? (
                        <div className="space-y-4 flex-1 overflow-y-auto pb-4">
                          {notes.map((note) => (
                            <div key={note.id} className="border rounded-lg p-4 break-words">
                              <div className="flex items-start justify-between mb-3 gap-4">
                                <h4 className="font-medium text-base flex-1 min-w-0">{note.title}</h4>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    {new Date(note.updated_at).toLocaleDateString()}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditNote(note)}
                                    className="flex-shrink-0"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="flex-shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              {note.chapter && (
                                <Badge variant="outline" className="mb-3">
                                  Chapter: {note.chapter}
                                </Badge>
                              )}
                              <div
                                className="text-sm text-muted-foreground prose prose-sm max-w-none break-words overflow-hidden"
                                dangerouslySetInnerHTML={{ __html: note.content }}
                              />
                              {note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {note.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-muted-foreground text-center py-4">
                            No notes yet. Start taking notes as you read!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
