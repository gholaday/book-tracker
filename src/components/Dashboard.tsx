"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserBook } from "@/types";
import BookList from "./BookList";
import { LogOut, BookOpen, CheckCircle, Plus } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import BookSearch from "./BookSearch";
import { useBookContext } from "@/contexts/BookContext";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("search");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const router = useRouter();

  const {
    isLoading,
    toReadBooks,
    readingBooks,
    completedBooks,
    loadUserBooks } = useBookContext();

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

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const handleBookAdded = () => {
    setActiveTab("to-read");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Book Tracker</h1>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Search Books
            </TabsTrigger>
            <TabsTrigger value="to-read" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Want to Read
              <Badge variant="secondary">{toReadBooks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="reading" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Reading
              <Badge variant="secondary">{readingBooks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed
              <Badge variant="secondary">{completedBooks.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <BookSearch onBookAdded={handleBookAdded} />
          </TabsContent>

          <TabsContent value="to-read" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="reading" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
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
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
