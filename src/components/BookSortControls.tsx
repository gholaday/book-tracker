import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowDownUp, ArrowUp, ArrowUpDown } from "lucide-react";

interface BookSortControlsProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortByChange: (value: string) => void;
  onSortOrderChange: () => void;
  className?: string;
}

export default function BookSortControls({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  className = "",
}: BookSortControlsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="rating">Rating</SelectItem>
          <SelectItem value="date_published">Date Published</SelectItem>
          <SelectItem value="date_read">Date Added</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={onSortOrderChange}
      >
        {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
      </Button>
    </div>
  );
}
