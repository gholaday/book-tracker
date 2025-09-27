import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, Star, FileText, Search } from "lucide-react";

export default async function Home() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <BookOpen className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Book Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your reading journey with personalized book lists, reviews,
            and rich notes. Discover new books and keep track of your literary
            adventures.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Search className="h-8 w-8 mx-auto text-blue-600" />
              <CardTitle>Search Books</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Find books using Google Books API with detailed information and
                covers
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-8 w-8 mx-auto text-green-600" />
              <CardTitle>Track Reading</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize books into "Want to Read" and "Completed" lists
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Star className="h-8 w-8 mx-auto text-yellow-600" />
              <CardTitle>Rate & Review</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Add star ratings and written reviews for completed books
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="h-8 w-8 mx-auto text-purple-600" />
              <CardTitle>Rich Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Take detailed notes with rich text editing and organization
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
