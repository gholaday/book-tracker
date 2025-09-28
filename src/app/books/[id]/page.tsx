import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getBookDetails, getBookReviews } from "@/lib/actions/books";
import { getBookNotes } from "@/lib/actions/notes";
import BookDetails from "@/components/BookDetails";
import DashboardLayout from "@/components/DashboardLayout";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  await requireAuth();

  const { id } = await params;

  try {
    const [book, reviews, notes] = await Promise.all([
      getBookDetails(id),
      getBookReviews(id),
      getBookNotes(id),
    ]);

    if (!book) {
      notFound();
    }

    return (
      <DashboardLayout>
        <BookDetails book={book} reviews={reviews} notes={notes} />
      </DashboardLayout>
    );
  } catch (error) {
    console.error("Error loading book details:", error);
    notFound();
  }
}
