import { useState, useEffect, useRef } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useChat } from '@ai-sdk/react';
import { useTRPC } from '../trpc/react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal, Loader2, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import AppLayout from '@/components/layout/AppLayout'; 
import { ScrollArea } from '@/components/ui/scroll-area';

export const Route = createFileRoute('/chat/$noteId')({
  component: NoteChatPage,
});

function NoteChatPage() {
  const { noteId } = Route.useParams();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch note data
  const { data: note, isLoading: isLoadingNote, isError } = useQuery(
    trpc.notes.getNoteById.queryOptions({ noteId })
  );
  
  // Initialize chat with the custom API endpoint
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isChatLoading,
    setMessages,
  } = useChat({
    api: '/api/chatnote',
    id: `note-chat-${noteId}`,
  });

  // Add system message with note content when note is loaded
  useEffect(() => {
    if (note && messages.length === 0) {
      setMessages([
        {
          id: 'system-context',
          role: 'system',
          content: note.content,
        }
      ]);
    }
  }, [note, messages.length, setMessages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Extract note title from content
  const getNoteTitle = () => {
    if (!note) return 'Chat';
    const firstLine = note.content.split('\n')[0];
    return `Chat: ${firstLine.replace(/^#\s+/, '').trim() || 'Untitled Note'}`;
  };

  // Loading state
  if (isLoadingNote) {
    return (
      <AppLayout title="Loading..." showBackButton={true}>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading note...</p>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (isError || !note) {
    return (
      <AppLayout title="Error" showBackButton={true}>
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold text-destructive">Error Loading Note</h2>
          <p className="mt-2">Could not find the requested note.</p>
          <Button 
            onClick={() => navigate({ to: '/notes' })} 
            className="mt-4"
          >
            Return to Notes
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    // <AppLayout title={getNoteTitle()} showBackButton={true}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Back button and note info */}
        <div className="p-4 border-b bg-background/60 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Link to="/notes/$noteId" params={{ noteId }}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Note</span>
            </Link>
            <h1 className="text-lg font-medium truncate">{getNoteTitle()}</h1>
          </div>
        </div>

        {/* Messages area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 pb-20">
            {/* Initial guidance message */}
            {messages.length <= 1 && (
              <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground">
                <p>Ask questions about this note or request summaries of specific sections.</p>
              </div>
            )}
            
            {/* Chat messages - filter out system message */}
            {messages
              .filter(message => message.role !== 'system')
              .map(message => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose dark:prose-invert prose-sm">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
            
            {/* Loading indicator */}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="p-4 border-t sticky bottom-0 bg-background">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about this note..."
              className="flex-1"
              disabled={isChatLoading}
            />
            <Button type="submit" size="icon" disabled={isChatLoading || !input.trim()}>
              <SendHorizonal className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    // </AppLayout>
  );
}
