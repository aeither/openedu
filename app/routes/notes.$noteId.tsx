import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from 'react-markdown';
import { useTRPC } from '../trpc/react';
import { Check, Edit, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import AppLayout from '@/components/layout/AppLayout';
import { useQuery, useMutation } from '@tanstack/react-query';

export const Route = createFileRoute('/notes/$noteId')({
  component: NoteDetailPage,
});

function NoteDetailPage() {
  const { noteId } = Route.useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const trpc = useTRPC();

  // Fetch note data using the query hook from tRPC
  const { data: note, isLoading, isError, error, refetch } = useQuery(
    trpc.notes.getNoteById.queryOptions({ noteId })
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note?.content || '');

  // Update note mutation
  const updateNoteMutation = useMutation(
    trpc.notes.updateNote.mutationOptions({
      onSuccess: () => {
        // Refetch the note data to update the UI
        refetch();
        
        toast({
          title: "Note saved",
          description: "Your changes have been saved successfully.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: `Failed to save note: ${error.message}`,
          variant: "destructive",
        });
      }
    })
  );

  const handleEdit = () => {
    setEditedContent(note?.content || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(note?.content || '');
  };

  const handleSave = async () => {
    if (!note) return;
    
    updateNoteMutation.mutate({ 
      id: noteId, 
      content: editedContent 
    });
    
    setIsEditing(false);
  };

  const handleCreateQuiz = () => {
    if (!note) return;
    // Navigate to quiz generator with prefilled content
    navigate({ to: '/quiz', search: { content: note.content } });
  };

  if (isLoading) {
    return (
      <AppLayout title="Notes" showBackButton={true}>
        <div className="space-y-4 p-4">
          <div className="animate-pulse h-8 w-1/3 bg-muted rounded mb-4"></div>
          <div className="animate-pulse h-10 w-full bg-muted rounded mb-4"></div>
          <div className="animate-pulse h-64 w-full bg-muted rounded"></div>
        </div>
      </AppLayout>
    );
  }

  if (isError || !note) {
    return (
      <AppLayout title="Notes" showBackButton={true}>
        <div className="space-y-4 p-4">
          <div className="border border-destructive rounded-md p-4 bg-destructive/5">
            <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Note</h2>
            <p>{error instanceof Error ? error.message : 'Could not find this note'}</p>
            <Button onClick={() => navigate({ to: '/' })} className="mt-4">
              Return to Notes
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Extract title from content (first line)
  const getTitle = () => {
    const firstLine = note.content.split('\n')[0];
    return firstLine.replace(/^#\s+/, '').trim() || 'Untitled Note';
  };

  return (
    <AppLayout title="Notes" showBackButton={true}>
      <div className="space-y-4 p-4">
        {/* Title section */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold truncate">{getTitle()}</h1>
          <p className="text-sm text-muted-foreground">
            Updated: {new Date(note.updatedAt).toLocaleString()}
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">Create Flashcard</Button>
            <Button variant="outline" size="sm" onClick={handleCreateQuiz}>Create Quiz</Button>
            <Button variant="outline" size="sm">Chat</Button>
            {!isEditing && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleEdit} 
                aria-label="Edit note"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="border rounded-md p-4 min-h-[300px]">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Enter your note in Markdown..."
                className="min-h-[300px] font-mono"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={updateNoteMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={updateNoteMutation.isPending}
                >
                  {updateNoteMutation.isPending ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></span>
                      Saving...
                    </span>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
