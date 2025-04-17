import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTRPC } from '@/trpc/react';
import { useAccount } from "wagmi";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardResponse {
  flashcards: Flashcard[];
  noteId?: string;
  deckName?: string;
}

export const Route = createFileRoute('/flashcard/')({
  head: () => ({
    meta: [{ title: 'Flashcard Generator' }],
  }),
  component: FlashcardComponent,
});

function FlashcardComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [content, setContent] = useState('');
  const [count, setCount] = useState(8);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);

  const generateFlashcardMutation = useMutation(
    trpc.flashcard.generateFlashcards.mutationOptions({
      onSuccess: (data: FlashcardResponse) => {
        setFlashcards(data.flashcards);
        
        // Navigate to the flashcard deck page if we have a noteId
        if (data.noteId) {
          // Use string concatenation for the path to avoid type errors
          navigate({ to: '/flashcard/' + data.noteId, params: { deckId: data.noteId } });
        }
      },
      onError: (error: any) => {
        console.error('Error generating flashcards:', error);
        setFlashcards(null);
      }
    })
  );

  const handleGenerate = () => {
    if (!content || !address) {
      generateFlashcardMutation.reset();
      return;
    }

    setFlashcards(null);
    generateFlashcardMutation.mutate({ 
      content, 
      count,
      userAddress: address
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Flashcard Generator</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate New Flashcards</CardTitle>
          <CardDescription>Enter educational content to generate flashcards from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste or enter educational content to generate flashcards from"
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="count">Number of Flashcards</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                min={1}
                max={20}
              />
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={generateFlashcardMutation.isPending || !isConnected}
              className="w-full"
            >
              {generateFlashcardMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Flashcards...
                </>
              ) : !isConnected ? (
                'Connect Wallet to Generate Flashcards'
              ) : (
                'Generate Flashcards'
              )}
            </Button>
            {generateFlashcardMutation.isError && (
              <p className="text-destructive text-sm">
                {generateFlashcardMutation.error instanceof Error 
                  ? generateFlashcardMutation.error.message 
                  : 'Failed to generate flashcards'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {flashcards && flashcards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Flashcards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {flashcards.map((fc, idx) => (
              <div key={idx} className="border rounded p-3 mb-2">
                <div className="font-semibold">Front:</div>
                <div className="mb-2">{fc.front}</div>
                <div className="font-semibold">Back:</div>
                <div>{fc.back}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
