"use client";

import type { Book, BookCardProps, BookListType } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/ui/star-rating";
import BookActions from "./BookActions";
import { useBookActions } from "@/hooks/useBookActions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, FileText } from "lucide-react";

const BookCard = function BookCard({
  book,
  showActions = true,
  onAddToList,
  onRemoveFromList,
  currentListType,
  userRating = 0,
  addedAt,
}: BookCardProps) {
  const [currentRating, setCurrentRating] = useState(userRating);
  const router = useRouter();
  const { handleRatingChange } = useBookActions();

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    setCurrentRating(userRating);
  }, [userRating]);

  const handleViewDetails = () => {
    router.push(`/books/${book.id}`);
  };

  const handleViewNotes = () => {
    router.push(`/books/${book.id}#notes`);
  };

  const handleRating = async (rating: number) => {
    setCurrentRating(rating);
    await handleRatingChange(book, rating);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex gap-2">
          {book.cover_url && (
            <div className="flex-shrink-0">
              <Image
                src={book.cover_url}
                alt={`${book.title} cover`}
                width={80}
                height={120}
                className="rounded-md object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {book.authors.join(", ")}
            </p>
            {book.published_date && (
              <p className="text-xs text-muted-foreground mb-1">
                Published: {book.published_date}
              </p>
            )}
            {addedAt && (
              <p className="text-xs text-muted-foreground mb-2">
                Added: {formatDate(addedAt)}
              </p>
            )}
            <div className="flex justify-start">
              <StarRating
                rating={currentRating}
                onRatingChange={handleRating}
                size="sm"
                interactive={true}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        {book.description && (
          <div
            className="text-sm text-muted-foreground line-clamp-5 mb-4"
            dangerouslySetInnerHTML={{ __html: book.description }}
          />
        )}

        {book.categories && book.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {book.categories.slice(0, 1).map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        )}

        {showActions && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>

              {currentListType && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewNotes}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Notes
                </Button>
              )}
            </div>

            <BookActions
              book={book}
              currentListType={currentListType}
              onAddToList={onAddToList}
              onRemoveFromList={onRemoveFromList}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BookCard;
