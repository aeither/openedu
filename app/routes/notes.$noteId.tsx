import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, ErrorComponent, Link } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from 'react-markdown';
import { useTRPC } from '../trpc/react';
import { Check, Edit, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import AppLayout from '@/components/layout/AppLayout';

export const Route = createFileRoute('/notes/$noteId')({
  loader: async ({ params: { noteId }, context }) => {
    // In a real app, this would fetch from your API
    // This is a mock implementation
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
    
    return { 
      note: {
        id: noteId,
        title: `Note ${noteId}`,
        content: `# Introduction to Kiwinote\n\nThis is a sample note using Markdown.\n\n- Feature 1\n- Feature 2\n\n## Section 2\n\nSome more details here.\n\n\`\`\`javascript\nconsole.log("Hello, Markdown!");\n\`\`\``
      } 
    };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData.note.title }],
  }),
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
  component: NoteDetailPage,
});

function NoteDetailPage() {
  const { noteId } = Route.useParams();
  const { note } = Route.useLoaderData();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [editedContent, setEditedContent] = useState(note.content);
  const { toast } = useToast();
  const trpc = useTRPC();
  
  // In a real app, you would have a mutation like this
  // const updateNoteMutation = trpc.notes.update.useMutation();

  const handleEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  const handleSave = async () => {
    // In a real app, you would call your mutation here
    // await updateNoteMutation.mutateAsync({ 
    //   id: noteId, 
    //   content: editedContent 
    // });
    
    // For demo purposes, just simulate a save
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Optimistically update the content
    setContent(editedContent);
    setIsEditing(false);
    
    toast({
      title: "Note saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <AppLayout title="Notes" showBackButton={true}>
    <div className="space-y-4 p-4">
      {/* Title section */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{note.title}</h1>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">Create Flashcard</Button>
          <Button variant="outline" size="sm">Create Quiz</Button>
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
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
              >
                <Check className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
            </AppLayout>
  );
}
