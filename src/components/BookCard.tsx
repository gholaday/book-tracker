"use client";

import type { Book, BookCardProps, BookListType } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addBookToList, removeBookFromList } from "@/lib/actions/books";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Minus, Eye } from "lucide-react";

export default function BookCard({
  book,
  showActions = true,
  onAddToList,
  onRemoveFromList,
  currentListType,
}: BookCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddToList = async (listType: BookListType) => {
    setIsLoading(true);
    try {
      await addBookToList(book.id, listType);
      onAddToList?.(book, listType);
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
      onRemoveFromList?.(book.id);
    } catch (error) {
      console.error("Error removing book from list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = () => {
    router.push(`/books/${book.id}`);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex gap-4">
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
              <p className="text-xs text-muted-foreground">
                {book.published_date}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        {book.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {book.description}
          </p>
        )}

        {book.categories && book.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {book.categories.slice(0, 3).map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>

            {currentListType ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveFromList}
                disabled={isLoading}
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-1" />
                Remove
              </Button>
            ) : (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAddToList("to-read")}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  To Read
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddToList("completed")}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Completed
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
