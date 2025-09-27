"use client";

import { useState, useEffect } from "react";
import { Book, Review, Note, BookListType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Star,
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  BookOpen,
  Plus,
  CheckCircle,
  Trash2,
  Edit,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { addBookToList, removeBookFromList, addReview, getUserBooks } from "@/lib/actions/books";
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
  const [showReviews, setShowReviews] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [reviews, setReviews] = useState(initialReviews);
  const [notes, setNotes] = useState(initialNotes);
  const [currentListType, setCurrentListType] = useState<BookListType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  
  // Note form state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteChapter, setNoteChapter] = useState("");
  const [noteTags, setNoteTags] = useState("");

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  // Check user's book status on component mount
  useEffect(() => {
    const checkUserBookStatus = async () => {
      try {
        const userBooks = await getUserBooks();
        const userBook = userBooks.find(ub => ub.book_id === book.id);
        setCurrentListType(userBook?.list_type || null);
      } catch (error) {
        console.error("Error checking user book status:", error);
      }
    };
    
    checkUserBookStatus();
  }, [book.id]);

  const handleAddToList = async (listType: BookListType) => {
    setIsLoading(true);
    try {
      await addBookToList(book.id, listType);
      setCurrentListType(listType);
    } catch (error) {
      console.error("Error adding book to list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromList = async () => {
    setIsLoading(true);
    try {
      await removeBookFromList(book.id);
      setCurrentListType(null);
    } catch (error) {
      console.error("Error removing book from list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    setIsLoading(true);
    try {
      await addReview(book.id, reviewRating, reviewText);
      // Refresh reviews
      setReviews([...reviews, {
        id: Date.now().toString(), // Temporary ID
        user_id: "", // Will be set by server
        book_id: book.id,
        rating: reviewRating,
        review_text: reviewText,
        created_at: new Date(),
        updated_at: new Date(),
      }]);
      setReviewRating(5);
      setReviewText("");
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitNote = async () => {
    setIsLoading(true);
    try {
      const tags = noteTags.split(",").map(tag => tag.trim()).filter(Boolean);
      
      if (editingNote) {
        await updateNote(editingNote.id, noteTitle, noteContent, noteChapter, tags);
        setNotes(notes.map(note => 
          note.id === editingNote.id 
            ? { ...note, title: noteTitle, content: noteContent, chapter: noteChapter, tags, updated_at: new Date() }
            : note
        ));
        setEditingNote(null);
      } else {
        const newNote = await createNote(book.id, noteTitle, noteContent, noteChapter, tags);
        setNotes([...notes, newNote]);
      }
      
      setNoteTitle("");
      setNoteContent("");
      setNoteChapter("");
      setNoteTags("");
      setShowNoteForm(false);
    } catch (error) {
      console.error("Error submitting note:", error);
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
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" = "md") => {
    const stars = [];
    const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`${sizeClass} ${
            i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />,
      );
    }
    return stars;
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Book Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  {book.cover_url && (
                    <Image
                      src={book.cover_url}
                      alt={`${book.title} cover`}
                      width={200}
                      height={300}
                      className="rounded-lg mx-auto mb-4 shadow-md"
                    />
                  )}

                  <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    {book.authors.join(", ")}
                  </p>

                  {/* Rating */}
                  {averageRating > 0 && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="flex">
                        {renderStars(Math.round(averageRating))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {averageRating.toFixed(1)} ({reviews.length} reviews)
                      </span>
                    </div>
                  )}

                  {/* Book Details */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {book.published_date && (
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{book.published_date}</span>
                      </div>
                    )}
                    {book.publisher && (
                      <div className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{book.publisher}</span>
                      </div>
                    )}
                    {book.page_count && (
                      <div className="flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{book.page_count} pages</span>
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  {book.categories && book.categories.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {book.categories.map((category, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-2">
                    {currentListType === null ? (
                      <>
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={() => handleAddToList('to-read')}
                          disabled={isLoading}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to To-Read List
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          size="sm"
                          onClick={() => handleAddToList('completed')}
                          disabled={isLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Completed
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Badge 
                          variant={currentListType === 'completed' ? 'default' : 'secondary'}
                          className="w-full justify-center py-2"
                        >
                          {currentListType === 'completed' ? 'Completed' : 'To Read'}
                        </Badge>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          size="sm"
                          onClick={handleRemoveFromList}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove from List
                        </Button>
                        {currentListType === 'to-read' && (
                          <Button 
                            className="w-full" 
                            size="sm"
                            onClick={() => handleAddToList('completed')}
                            disabled={isLoading}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Completed
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* External Links */}
                  {book.preview_link && (
                    <div className="mt-4">
                      <Link
                        href={book.preview_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          Preview on Google Books
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Description & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {book.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {book.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Reviews ({reviews.length})
                  </span>
                  <div className="flex gap-2">
                    {currentListType === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Review
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReviews(!showReviews)}
                    >
                      {showReviews ? "Hide" : "Show"} Reviews
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              {showReviewForm && (
                <CardContent className="border-t">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <Select value={reviewRating.toString()} onValueChange={(value) => setReviewRating(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Star</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="review-text">Review (optional)</Label>
                      <Textarea
                        id="review-text"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your thoughts about this book..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitReview} disabled={isLoading}>
                        Submit Review
                      </Button>
                      <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
              {showReviews && (
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-l-4 border-blue-200 pl-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(review.rating, "sm")}
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.review_text && (
                            <p className="text-sm text-muted-foreground">
                              {review.review_text}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No reviews yet. Be the first to review this book!
                    </p>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Notes */}
            <Card>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNotes(!showNotes)}
                    >
                      {showNotes ? "Hide" : "Show"} Notes
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              {showNoteForm && (
                <CardContent className="border-t">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="note-title">Title</Label>
                      <input
                        id="note-title"
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="Note title..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="note-chapter">Chapter (optional)</Label>
                      <input
                        id="note-chapter"
                        type="text"
                        value={noteChapter}
                        onChange={(e) => setNoteChapter(e.target.value)}
                        placeholder="e.g., Chapter 1, Introduction..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="note-content">Content</Label>
                      <Textarea
                        id="note-content"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Write your notes here..."
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="note-tags">Tags (comma-separated)</Label>
                      <input
                        id="note-tags"
                        type="text"
                        value={noteTags}
                        onChange={(e) => setNoteTags(e.target.value)}
                        placeholder="e.g., important, quotes, analysis..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
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
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
              {showNotes && (
                <CardContent>
                  {notes.length > 0 ? (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <div key={note.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{note.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {new Date(note.updated_at).toLocaleDateString()}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditNote(note)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {note.chapter && (
                            <Badge variant="outline" className="mb-2">
                              Chapter: {note.chapter}
                            </Badge>
                          )}
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {note.content}
                          </div>
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
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
                    <p className="text-muted-foreground text-center py-4">
                      No notes yet. Start taking notes as you read!
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
