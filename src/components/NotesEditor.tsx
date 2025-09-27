"use client";

import { useState, useEffect } from "react";
import { Book, Note, NotesEditorProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  createNote,
  updateNote,
  deleteNote,
  getBookNotes,
  searchNotes,
} from "@/lib/actions/notes";
import {
  Plus,
  Save,
  Trash2,
  Search,
  Tag,
  FileText,
  Edit,
  Eye,
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function NotesEditor({
  book,
  initialNotes = [],
  onSave,
  onDelete,
}: NotesEditorProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(notes);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [chapter, setChapter] = useState("");
  const [section, setSection] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    loadNotes();
  }, [book.id]);

  useEffect(() => {
    filterNotes();
  }, [notes, searchQuery]);

  const loadNotes = async () => {
    try {
      const bookNotes = await getBookNotes(book.id);
      setNotes(bookNotes);
      setFilteredNotes(bookNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  const filterNotes = () => {
    if (!searchQuery.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
    setFilteredNotes(filtered);
  };

  const handleCreateNote = () => {
    setActiveNote(null);
    setIsEditing(true);
    setTitle("");
    setContent("");
    setChapter("");
    setSection("");
    setTags([]);
  };

  const handleEditNote = (note: Note) => {
    setActiveNote(note);
    setIsEditing(true);
    setTitle(note.title);
    setContent(note.content);
    setChapter(note.chapter || "");
    setSection(note.section || "");
    setTags(note.tags);
  };

  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsLoading(true);
    try {
      let savedNote: Note;

      if (activeNote) {
        savedNote = await updateNote(
          activeNote.id,
          title,
          content,
          chapter || undefined,
          section || undefined,
          tags,
        );
      } else {
        savedNote = await createNote(
          book.id,
          title,
          content,
          chapter || undefined,
          section || undefined,
          tags,
        );
      }

      await loadNotes();
      setIsEditing(false);
      setActiveNote(null);
      onSave?.(savedNote);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    setIsLoading(true);
    try {
      await deleteNote(noteId);
      await loadNotes();
      if (activeNote?.id === noteId) {
        setActiveNote(null);
        setIsEditing(false);
      }
      onDelete?.(noteId);
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setActiveNote(null);
    setTitle("");
    setContent("");
    setChapter("");
    setSection("");
    setTags([]);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTag();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Notes for {book.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={handleCreateNote} disabled={isEditing}>
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList>
              <TabsTrigger value="list">Notes List</TabsTrigger>
              <TabsTrigger value="editor" disabled={!isEditing}>
                {activeNote ? "Edit Note" : "New Note"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {filteredNotes.length > 0 ? (
                <div className="space-y-3">
                  {filteredNotes.map((note) => (
                    <Card
                      key={note.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{note.title}</h4>
                            {note.chapter && (
                              <Badge variant="outline" className="mb-2 text-xs">
                                Chapter {note.chapter}
                              </Badge>
                            )}
                            <div
                              className="text-sm text-muted-foreground line-clamp-2"
                              dangerouslySetInnerHTML={{
                                __html:
                                  note.content
                                    .replace(/<[^>]*>/g, "")
                                    .substring(0, 200) + "...",
                              }}
                            />
                            {note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {note.tags.map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(note.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNote(note)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No notes yet</p>
                  <p className="text-sm">
                    Create your first note to get started!
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="editor" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {activeNote ? "Edit Note" : "Create New Note"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter note title..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="chapter">Chapter</Label>
                      <Input
                        id="chapter"
                        value={chapter}
                        onChange={(e) => setChapter(e.target.value)}
                        placeholder="e.g., Chapter 1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="section">Section</Label>
                      <Input
                        id="section"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        placeholder="e.g., Introduction"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        id="tags"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a tag..."
                      />
                      <Button onClick={addTag} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <div className="border rounded-md">
                      <ReactQuill
                        value={content}
                        onChange={setContent}
                        placeholder="Write your notes here..."
                        style={{ height: "300px" }}
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ color: [] }, { background: [] }],
                            [{ list: "ordered" }, { list: "bullet" }],
                            ["blockquote", "code-block"],
                            ["link", "image"],
                            ["clean"],
                          ],
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveNote}
                      disabled={isLoading || !title.trim() || !content.trim()}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Note"}
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
