import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useTRPC } from '@/trpc/react';
import { useAccount } from 'wagmi';

export const Route = createFileRoute('/')({
  component: Index,
});

interface Note {
  id: string;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

function Index() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { address } = useAccount();

  // Fetch notes for the current user
  const { data: notes, isLoading, isError } = useQuery({
    ...trpc.notes.getNotesByUser.queryOptions({ userAddress: address! }),
    enabled: !!address, // Only run the query if address exists
  });

  // Create note mutation
  const createNoteMutation = useMutation(
    trpc.notes.createNote.mutationOptions({
      onSuccess: (result) => {
        // Navigate to the new note
        if (result && result.id) {
          navigate({ to: '/notes/$noteId', params: { noteId: result.id } });
        }
      },
      onError: (error: any) => {
        console.error("Failed to create note:", error);
      }
    })
  );

  // Create user mutation to ensure user exists first
  const createUserMutation = useMutation(
    trpc.user.createUser.mutationOptions({
      onError: (error: any) => {
        console.error("Failed to create user:", error);
      }
    })
  );

  // Parse note data to extract title and preview from content
  const processNotes = (notes: Note[]) => {
    if (!notes || !Array.isArray(notes)) return [];

    return notes.map(note => {
      const lines = note.content.split('\n');
      const title = lines[0].replace(/^#\s+/, '').trim() || 'Untitled Note';

      // Get first non-title paragraph for preview
      const previewText = lines.slice(1).find(line => line.trim().length > 0) || '';

      // Create a basic emoji icon based on the title
      const icon = getIconForTitle(title);

      return {
        id: note.id,
        title,
        date: format(new Date(note.updatedAt), 'dd MMM yyyy'),
        icon,
        preview: previewText,
        updatedAt: new Date(note.updatedAt)
      };
    });
  };

  // Generate an icon based on the note title
  const getIconForTitle = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('blockchain')) return '🔗';
    if (lowerTitle.includes('machine learning') || lowerTitle.includes('ai')) return '🤖';
    if (lowerTitle.includes('quantum')) return '⚛️';
    if (lowerTitle.includes('welcome') || lowerTitle.includes('introduction')) return '👋';
    return '📝'; // Default icon
  };

  // Process fetched notes
  const processedNotes = processNotes(notes || []);

  // Get today's notes (notes updated today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayNotes = processedNotes.filter(note => {
    const noteDate = new Date(note.updatedAt);
    noteDate.setHours(0, 0, 0, 0);
    return noteDate.getTime() === today.getTime();
  });

  // Filter notes based on search query
  const filteredNotes = searchQuery
    ? processedNotes.filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.preview && note.preview.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    : processedNotes;

  const handleCreateNote = async () => {
    // Check if wallet is connected
    if (!address) {
      console.error("Cannot create note: Wallet not connected");
      return;
    }

    // Create a basic starter note template
    const content = "# New Note\n\nStart writing here...";

    // Ensure user exists first, then create note
    try {
      // Try to create user (this is idempotent - will not fail if user already exists)
      await createUserMutation.mutateAsync({ userAddress: address });
      
      // Create note mutation
      createNoteMutation.mutate({
        content,
        userAddress: address
      });
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  return (
    <AppLayout title="Learn" showBackButton={true}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="pt-6 pb-2 px-6">
          <h1 className="text-4xl font-bold mb-6">My notes</h1>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search notes & transcripts"
              className="pl-10 bg-muted border-none rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow px-6 pb-20">
          {isLoading ? (
            // Loading state
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-muted mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            // Error state
            <div className="text-center py-10">
              <p className="text-destructive mb-4">Could not load your notes</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : processedNotes.length === 0 ? (
            // Empty state
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">You don't have any notes yet</p>
              <Button
                onClick={handleCreateNote}
                disabled={createNoteMutation.isPending}
              >
                {createNoteMutation.isPending ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" /> Create Your First Note
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Notes listing
            <div className="space-y-6">
              {/* Today Section */}
              {todayNotes.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold mb-4">Today</h2>
                  <div className="space-y-3">
                    {todayNotes.map((note) => (
                      <Link to="/notes/$noteId" params={{ noteId: note.id }} key={note.id}>
                        <div className="bg-card rounded-xl p-4 flex items-center">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xl mr-3">
                            {note.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{note.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">{note.preview}</p>
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            <span className="text-2xl">&gt;</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Notes (if search is active or there are more notes than today) */}
              {(searchQuery || filteredNotes.length > todayNotes.length) && (
                <div>
                  <h2 className="text-3xl font-bold mb-4">
                    {searchQuery ? 'Search Results' : 'Recent'}
                  </h2>
                  <div className="space-y-3">
                    {filteredNotes
                      .filter((note) => !todayNotes.some((todayNote) => todayNote.id === note.id))
                      .map((note) => (
                        <Link to="/notes/$noteId" params={{ noteId: note.id }} key={note.id}>
                          <div className="bg-card rounded-xl p-4 flex items-center">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xl mr-3">
                              {note.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{note.title}</h3>
                              <p className="text-sm text-muted-foreground truncate">{note.preview}</p>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <span className="text-2xl">&gt;</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Sticky New Note Button */}
        <div className="sticky bottom-20 w-full flex justify-center">
          <Button
            className="rounded-full py-6 px-8 shadow-lg"
            onClick={handleCreateNote}
            disabled={createNoteMutation.isPending}
          >
            {createNoteMutation.isPending ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></span>
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" /> New Note
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
