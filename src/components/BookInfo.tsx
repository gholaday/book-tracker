import { Book, BookListType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/ui/star-rating";
import BookActions from "./BookActions";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BookOpen } from "lucide-react";

interface BookInfoProps {
  book: Book;
  currentListType?: BookListType | null;
  userRating?: number;
  addedAt?: string | Date | null;
  onAddToList?: (book: Book, listType: BookListType) => void;
  onRemoveFromList?: (bookId: string) => void;
  onStatusChange?: (book: Book, newStatus: BookListType) => void;
  onRatingChange?: (rating: number) => void;
}

export default function BookInfo({
  book,
  currentListType,
  userRating = 0,
  addedAt,
  onAddToList,
  onRemoveFromList,
  onStatusChange,
  onRatingChange,
}: BookInfoProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return (
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

          <div className="flex items-center justify-center gap-2 mb-4">
            <StarRating
              rating={userRating}
              onRatingChange={onRatingChange}
              size="md"
              interactive={true}
            />
            {userRating > 0 && (
              <span className="text-sm text-muted-foreground">
                {userRating} star{userRating > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            {book.published_date && (
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Published: {book.published_date}</span>
              </div>
            )}
            {addedAt && (
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Added: {formatDate(addedAt)}</span>
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

          {book.categories && book.categories.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1 justify-center">
                {book.categories.slice(0, 1).map((category, index) => (
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

          <BookActions
            book={book}
            currentListType={currentListType}
            className="mb-4"
          />

          {book.preview_link && (
            <Link
              href={book.preview_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="w-full">
                Preview on Google Books
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
