import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTRPC } from '@/trpc/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardDeckData {
  flashcards: Flashcard[];
  deckName: string;
}

export const Route = createFileRoute('/flashcard/$deckId')({
  component: FlashcardDeckComponent,
});

function FlashcardDeckComponent() {
  const { deckId } = Route.useParams();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const [current, setCurrent] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [deckCompleted, setDeckCompleted] = useState(false);

  // Fetch flashcards using the query hook from tRPC
  const { data, isLoading, isError, error } = useQuery(
    trpc.flashcard.getFlashcardsByDeckId.queryOptions({ deckId })
  );

  // Cast the data to our FlashcardDeckData type if it exists
  const deckData = data as FlashcardDeckData | undefined;

  const handleFlip = () => setShowBack(b => !b);
  
  const handlePrev = () => {
    setCurrent(c => Math.max(0, c - 1));
    setShowBack(false);
  };
  
  const handleNext = () => {
    if (!deckData) return;
    if (current < deckData.flashcards.length - 1) {
      setCurrent(c => c + 1);
      setShowBack(false);
    } else {
      setDeckCompleted(true);
    }
  };

  const handleBack = () => {
    navigate({ to: '/flashcard' });
  };

  const handleReplay = () => {
    setDeckCompleted(false);
    setCurrent(0);
    setShowBack(false);
  };

  // Page header with back button - used in all states
  const PageHeader = () => (
    <Button variant="ghost" className="mb-4" onClick={handleBack}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Flashcards
    </Button>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        
        <Card className="border-destructive max-w-lg mx-auto">
          <CardHeader className="bg-destructive/5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Flashcards Not Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">
              {error instanceof Error ? error.message : 'The requested flashcards could not be found.'}
            </p>
            <Button onClick={handleBack} className="w-full">
              Go to Flashcard Generator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!deckData || !deckData.flashcards || deckData.flashcards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        
        <Card className="border-warning max-w-lg mx-auto">
          <CardHeader className="bg-warning/5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <CardTitle>Empty Flashcard Deck</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">
              This flashcard deck is empty. Please try generating new flashcards.
            </p>
            <Button onClick={handleBack} className="w-full">
              Go to Flashcard Generator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (deckCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        <Card className="max-w-lg mx-auto">
          <CardHeader className="bg-primary/5 text-center">
            <CardTitle>Deck Completed!</CardTitle>
            <CardDescription>You have reviewed all the flashcards.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center space-x-4">
            <Button onClick={handleReplay}>Replay Deck</Button>
            <Button onClick={handleBack}>Back to Flashcards</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const card = deckData.flashcards[current];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader />
      
      {/* Deck header with progress */}
      <div className="max-w-lg mx-auto mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">{deckData.deckName}</h2>
          <Badge variant="outline">{current + 1} / {deckData.flashcards.length}</Badge>
        </div>
        <Progress value={((current + 1) / deckData.flashcards.length) * 100} className="h-2 rounded-full" />
      </div>
      
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Card {current + 1} of {deckData.flashcards.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="w-full h-[200px] cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={handleFlip}
          >
            <div
              className="relative w-full h-full"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.5s',
                transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center p-6 bg-accent/10 rounded-md"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {card.front}
              </div>
              <div
                className="absolute inset-0 flex items-center justify-center p-6 bg-accent/30 rounded-md"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {card.back}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={handlePrev} disabled={current === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button variant="outline" size="sm" onClick={handleNext}>
            {current === deckData.flashcards.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
      <div className="mt-4 text-center text-muted-foreground">
        Click on the card to view the answer.
      </div>
    </div>
  );
}
