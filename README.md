# Book Tracker

A personal book tracking web application built with Next.js 14+, TypeScript, and Supabase. Track your reading journey with personalized book lists, reviews, and rich notes.

## Features

- **User Authentication**: Secure email/password authentication via Supabase
- **Book Search**: Search for books using Google Books API
- **Book Lists**: Organize books into "To-Read" and "Completed" lists
- **Reviews & Ratings**: Rate and review completed books (1-5 stars)
- **Rich Notes**: Take detailed notes with rich text editing using React Quill
- **Notes Organization**: Organize notes by chapters and sections with tagging
- **Note Search**: Search through your notes by title, content, or tags
- **Clean UI**: Modern, responsive interface using Shadcn UI components

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict typing)
- **UI**: Shadcn UI components with Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth
- **Rich Text**: React Quill
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- Google Books API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd book-tracker
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp env.example .env.local
```

4. Configure your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Books API
NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=your_google_books_api_key

# Database URL (for Drizzle)
DATABASE_URL=your_supabase_database_url
```

### Database Setup

1. Generate database migrations:

```bash
pnpm db:generate
```

2. Run migrations (this will create the tables in your Supabase database):

```bash
pnpm db:migrate
```

3. (Optional) Open Drizzle Studio to view your database:

```bash
pnpm db:studio
```

### Running the Application

1. Start the development server:

```bash
pnpm dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── books/             # Book detail pages
│   ├── dashboard/         # Main dashboard
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn UI components
│   ├── BookCard.tsx      # Book display component
│   ├── BookDetails.tsx   # Book detail view
│   ├── BookSearch.tsx    # Book search component
│   ├── Dashboard.tsx     # Main dashboard
│   └── NotesEditor.tsx   # Rich notes editor
├── lib/                  # Utilities and configurations
│   ├── actions/          # Server actions
│   ├── db/              # Database schema and connection
│   ├── supabase/        # Supabase client configuration
│   ├── auth.ts          # Authentication utilities
│   └── google-books.ts  # Google Books API integration
└── types/               # TypeScript type definitions
```

## Database Schema

The application uses the following main tables:

- **books**: Stores book information from Google Books API
- **user_books**: Tracks which books users have added to their lists
- **reviews**: User reviews and ratings for books
- **notes**: Rich text notes for books with organization
- **quotes**: Highlighted quotes within notes

## Key Features

### Book Management

- Search for books using Google Books API
- Add books to "To-Read" or "Completed" lists
- View detailed book information with covers and descriptions

### Notes System

- Rich text editing with React Quill
- Chapter and section organization
- Tagging system for easy categorization
- Search functionality across all notes
- Export capabilities (planned)

### Reviews & Ratings

- 1-5 star rating system
- Written reviews for completed books
- View all reviews for a book

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linter
- `pnpm format` - Format code
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio

### Adding New Features

1. Create TypeScript types in `src/types/`
2. Add database schema changes in `src/lib/db/schema.ts`
3. Generate and run migrations
4. Create server actions in `src/lib/actions/`
5. Build UI components in `src/components/`
6. Add pages in `src/app/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
