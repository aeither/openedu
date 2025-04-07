import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: Index,
});

interface Note {
  id: string;
  title: string;
  date: string;
  icon?: string;
  preview?: string;
}

function Index() {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mock data for notes
  const todayNotes: Note[] = [
    {
      id: '1',
      title: 'Welcome to Dailywiser!',
      date: '07 Apr 2025',
      icon: '🥝',
      preview: 'Get started with your note-taking journey...',
    },
  ];

  const allNotes: Note[] = [
    ...todayNotes,
    {
      id: '2',
      title: 'Shopping List',
      date: '06 Apr 2025',
      icon: '🛒',
      preview: 'Milk, eggs, bread...',
    },
    {
      id: '3',
      title: 'Meeting Notes',
      date: '05 Apr 2025',
      icon: '📝',
      preview: 'Discussed project timeline and deliverables...',
    },
    {
      id: '4',
      title: 'Ideas for Project',
      date: '03 Apr 2025',
      icon: '💡',
      preview: 'Feature suggestions and improvements...',
    },
  ];

  // Filter notes based on search query
  const filteredNotes = searchQuery
    ? allNotes.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.preview && note.preview.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : allNotes;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="pt-6 pb-2 px-6">
        <h1 className="text-4xl font-bold mb-6">My notes</h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search notes & transcripts"
            className="pl-10 bg-muted border-none rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-2 bg-muted rounded-lg">
            <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-active">
              All notes
            </TabsTrigger>
            <TabsTrigger value="folders" className="rounded-md data-[state=active]:bg-active">
              Folders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-6">
            {/* Today Section */}
            <div>
              <h2 className="text-3xl font-bold mb-4">Today</h2>
              <div className="space-y-3">
                {todayNotes.map((note) => (
                  <Link to={`/notes/${note.id}`} key={note.id}>
                    <div className="bg-card rounded-xl p-4 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xl mr-3">
                        {note.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{note.title}</h3>
                        <p className="text-sm text-muted-foreground">{note.date}</p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-2xl">&gt;</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Notes (if search is active or there are more notes) */}
            {(searchQuery || filteredNotes.length > todayNotes.length) && (
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  {searchQuery ? 'Search Results' : 'Recent'}
                </h2>
                <div className="space-y-3">
                  {filteredNotes
                    .filter((note) => !todayNotes.some((todayNote) => todayNote.id === note.id))
                    .map((note) => (
                      <Link to={`/notes/${note.id}`} key={note.id}>
                        <div className="bg-card rounded-xl p-4 flex items-center">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xl mr-3">
                            {note.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">{note.title}</h3>
                            <p className="text-sm text-muted-foreground">{note.date}</p>
                          </div>
                          <div className="ml-auto">
                            <span className="text-2xl">&gt;</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="folders" className="mt-6">
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <h3 className="text-xl mb-2">Folder View</h3>
              <p className="text-muted-foreground">Your folders will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </header>

      {/* Main Content Area - Flex grow to push button to bottom */}
      <main className="flex-grow"></main>

      {/* Sticky New Note Button */}
      <div className="sticky bottom-8 w-full flex justify-center">
        <Button
          className="rounded-full py-6 px-8 shadow-lg"
          onClick={() => console.log('Create new note')}
        >
          <Plus className="w-5 h-5 mr-2" /> New Note
        </Button>
      </div>
    </div>
  );
}
