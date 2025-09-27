"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getUserBooks } from "@/lib/actions/books";
import { UserBook } from "@/types";
import BookCard from "./BookCard";
import { LogOut, BookOpen, CheckCircle, Plus } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import BookSearch from "./BookSearch";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("search");
  const [toReadBooks, setToReadBooks] = useState<UserBook[]>([]);
  const [completedBooks, setCompletedBooks] = useState<UserBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUserBooks = async () => {
    try {
      const userBooks = await getUserBooks();
      setToReadBooks(userBooks.filter((book) => book.list_type === "to-read"));
      setCompletedBooks(
        userBooks.filter((book) => book.list_type === "completed"),
      );
    } catch (error) {
      console.error("Error loading user books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserBooks();
  }, []);

  const handleBookRemoved = (bookId: string) => {
    setToReadBooks((prev) => prev.filter((book) => book.book_id !== bookId));
    setCompletedBooks((prev) => prev.filter((book) => book.book_id !== bookId));
  };

  const handleBookAdded = () => {
    loadUserBooks(); // Reload the lists
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
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
              To Read
              <Badge variant="secondary">{toReadBooks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed
              <Badge variant="secondary">{completedBooks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <BookSearch onBookAdded={handleBookAdded} />
          </TabsContent>

          <TabsContent value="to-read" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Books to Read
                </CardTitle>
              </CardHeader>
              <CardContent>
                {toReadBooks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {toReadBooks.map((userBook) => (
                      <BookCard
                        key={userBook.id}
                        book={userBook.book!}
                        currentListType="to-read"
                        onRemoveFromList={handleBookRemoved}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      No books in your to-read list
                    </p>
                    <p className="text-sm">
                      Search for books and add them to get started!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Completed Books
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedBooks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedBooks.map((userBook) => (
                      <BookCard
                        key={userBook.id}
                        book={userBook.book!}
                        currentListType="completed"
                        onRemoveFromList={handleBookRemoved}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      No completed books yet
                    </p>
                    <p className="text-sm">
                      Mark books as completed when you finish reading them!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    Notes feature coming soon
                  </p>
                  <p className="text-sm">
                    You'll be able to take rich notes on your completed books!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
