"use client";

import { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import { Search, Loader2 } from "lucide-react";
import { searchBooksAction } from "@/lib/actions/books";
import type { Book } from "@/types";
import BookCard from "./BookCard";

interface BookSearchProps {
  onBookAdded?: () => void;
}

export default function BookSearch({ onBookAdded }: BookSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { addToast } = useToast();


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const searchResults = await searchBooksAction(query);
      setResults(searchResults);

      if (searchResults.length === 0) {
        addToast({
          title: "No Results",
          description: "No books found for your search. Try different keywords.",
          variant: "default",
          duration: 4000,
        });
      } else {
        addToast({
          title: "Search Complete",
          description: `Found ${searchResults.length} book${searchResults.length > 1 ? 's' : ''}`,
          variant: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      addToast({
        title: "Search Error",
        description: "Failed to search books. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAdded = useCallback(() => {
    // Notify parent component that a book was added
    onBookAdded?.();
  }, [onBookAdded]);

  const searchResultsContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    if (results.length > 0) {
      return (
        <>
          <h3 className="text-lg font-semibold">
            Search Results ({results.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((book) => {
              // Create a userBook-like object for search results
              const userBook = {
                id: `search-${book.id}`,
                user_id: '',
                book_id: book.id,
                list_type: null as any,
                added_at: new Date(),
                book: book,
                user_rating: null
              };

              return (
                <BookCard
                  key={book.id}
                  userBook={userBook}
                  showActions={true}
                />
              );
            })}
          </div>
        </>
      );
    }

    return (
      <div className="text-center py-8 text-muted-foreground">
        No books found. Try a different search term.
      </div>
    );
  }, [isLoading, results, handleBookAdded]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Books</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for books by title, author, or ISBN..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          {searchResultsContent}
        </div>
      )}
    </div>
  );
}
