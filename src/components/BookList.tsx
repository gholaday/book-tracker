import { UserBook } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BookCard from "./BookCard";
import BookSortControls from "./BookSortControls";
import BookSearchFilter from "./BookSearchFilter";
import { BookOpen, CheckCircle, Search } from "lucide-react";
import { useState, useMemo } from "react";

interface BookListProps {
  books: UserBook[];
  title: string;
  icon: React.ReactNode;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortByChange: (value: string) => void;
  onSortOrderChange: () => void;
  emptyMessage: string;
  emptyDescription: string;
}

export default function BookList({
  books,
  title,
  icon,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  emptyMessage,
  emptyDescription,
}: BookListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;

    const query = searchQuery.toLowerCase();
    return books.filter((userBook) => {
      const book = userBook.book;
      if (!book) return false;

      return (
        book.title.toLowerCase().includes(query) ||
        book.authors.some(author => author.toLowerCase().includes(query)) ||
        (book.description && book.description.toLowerCase().includes(query)) ||
        (book.categories && book.categories.some(category => category.toLowerCase().includes(query)))
      );
    });
  }, [books, searchQuery]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <div className="flex items-center gap-4">
            <BookSearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-64"
            />
            <BookSortControls
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={onSortByChange}
              onSortOrderChange={onSortOrderChange}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((userBook) => (
              <BookCard
                key={userBook.id}
                userBook={userBook}
              />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center flex flex-col justify-center items-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No books found</p>
            <p className="text-sm">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="text-center flex flex-col justify-center items-center py-12 text-muted-foreground">
            {icon}
            <p className="text-lg font-medium mt-4">{emptyMessage}</p>
            <p className="text-sm">{emptyDescription}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
