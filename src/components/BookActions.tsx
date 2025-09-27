import { Book, BookListType } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BookOpen, CheckCircle, MoreHorizontal, Trash2, Calendar, Plus } from "lucide-react";
import { useBookActions } from "@/hooks/useBookActions";
import { memo } from "react";

interface BookActionsProps {
  book: Book;
  currentListType?: BookListType | null;
  onAddToList?: (book: Book, listType: BookListType) => void;
  onRemoveFromList?: (bookId: string) => void;
  onStatusChange?: (book: Book, newStatus: BookListType) => void;
  className?: string;
}

const BookActions = memo(function BookActions({
  book,
  currentListType,
  onAddToList,
  onRemoveFromList,
  onStatusChange,
  className = "",
}: BookActionsProps) {
  const { isLoading, handleAddToList, handleRemoveFromList } = useBookActions();

  const handleStatusChange = async (newStatus: BookListType) => {
    await handleAddToList(book, newStatus, (book, listType) => {
      onAddToList?.(book, listType);
      onStatusChange?.(book, listType);
    });
  };

  const handleRemove = async () => {
    await handleRemoveFromList(book.id, book.title, onRemoveFromList);
  };

  if (!currentListType) {
    return (
      <div className={className}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full" size="sm" disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => handleStatusChange('to-read')}>
              <Calendar className="w-4 h-4 mr-2" />
              Add to Want to Read
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('reading')}>
              <BookOpen className="w-4 h-4 mr-2" />
              Mark as Reading
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className={`space-y-2 flex justify-between ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading} className="w-full">
            {currentListType === 'completed' ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : currentListType === 'reading' ? (
              <BookOpen className="w-4 h-4 mr-2" />
            ) : (
              <Calendar className="w-4 h-4 mr-2" />
            )}
            {currentListType === 'completed' ? 'Completed' : currentListType === 'reading' ? 'Reading' : 'Want to Read'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem
            onClick={() => handleStatusChange('to-read')}
            disabled={currentListType === 'to-read'}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Want to Read
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange('reading')}
            disabled={currentListType === 'reading'}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Reading
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange('completed')}
            disabled={currentListType === 'completed'}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Completed
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleRemove}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove from List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

export default BookActions;
