"use client";

import { useState, useEffect, useMemo } from "react";
import { UserBook } from "@/types";
import BookList from "./BookList";
import { BookOpen, CheckCircle, Loader2 } from "lucide-react";
import BookSearch from "./BookSearch";
import { useBookContext } from "@/contexts/BookContext";

export default function Dashboard() {
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const {
    isLoading,
    toReadBooks,
    readingBooks,
    completedBooks,
    loadUserBooks,
    activeTab,
    setActiveTab } = useBookContext();

  useEffect(() => {
    loadUserBooks(true);
  }, []);

  const sortBooks = (books: UserBook[]) => {
    return [...books].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "title":
          aValue = a.book?.title || "";
          bValue = b.book?.title || "";
          break;
        case "rating":
          aValue = a.user_rating || 0;
          bValue = b.user_rating || 0;
          break;
        case "date_published":
          aValue = new Date(a.book?.published_date || "");
          bValue = new Date(b.book?.published_date || "");
          break;
        case "date_read":
          aValue = new Date(a.added_at);
          bValue = new Date(b.added_at);
          break;
        default:
          aValue = a.book?.title || "";
          bValue = b.book?.title || "";
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Apply sorting to context books
  const sortedToReadBooks = useMemo(() => sortBooks(toReadBooks), [toReadBooks, sortBy, sortOrder]);
  const sortedReadingBooks = useMemo(() => sortBooks(readingBooks), [readingBooks, sortBy, sortOrder]);
  const sortedCompletedBooks = useMemo(() => sortBooks(completedBooks), [completedBooks, sortBy, sortOrder]);

  const handleBookAdded = () => {
    setActiveTab("to-read");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {activeTab === "search" && (
        <div className="space-y-6">
          <BookSearch onBookAdded={handleBookAdded} />
        </div>
      )}

      {activeTab === "to-read" && (
        <div className="space-y-6">
          <BookList
            books={sortedToReadBooks}
            title="Want to Read"
            icon={<BookOpen className="w-5 h-5" />}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={setSortBy}
            onSortOrderChange={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            emptyMessage="No books in your want to read list"
            emptyDescription="Search for books and add them to get started!"
          />
        </div>
      )}

      {activeTab === "reading" && (
        <div className="space-y-6">
          <BookList
            books={sortedReadingBooks}
            title="Currently Reading"
            icon={<BookOpen className="w-5 h-5" />}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={setSortBy}
            onSortOrderChange={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            emptyMessage="No books currently being read"
            emptyDescription="Start reading a book from your want to read list!"
          />
        </div>
      )}

      {activeTab === "completed" && (
        <div className="space-y-6">
          <BookList
            books={sortedCompletedBooks}
            title="Completed Books"
            icon={<CheckCircle className="w-5 h-5" />}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={setSortBy}
            onSortOrderChange={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            emptyMessage="No completed books yet"
            emptyDescription="Mark books as completed when you finish reading them!"
          />
        </div>
      )}
    </div>
  );
}
