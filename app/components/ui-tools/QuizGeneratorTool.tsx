import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, ChevronRight, AlertCircle } from "lucide-react";
import { useNavigate } from '@tanstack/react-router';
import { useTRPC } from '@/trpc/react';
import { useMutation } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

interface QuizResponse {
  quizId: string;
  noteId: string;
  questions: any[];
}

type QuizState = 'inputting' | 'generating' | 'success' | 'error';

export default function QuizGeneratorTool() {
  const [content, setContent] = useState('');
  const [state, setState] = useState<QuizState>('inputting');
  const [quizId, setQuizId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { address } = useAccount();

  // Generate quiz mutation
  const generateQuizMutation = useMutation(
    trpc.quiz.generateQuiz.mutationOptions({
      onSuccess: (data: QuizResponse) => {
        setState('success');
        setQuizId(data.quizId);
      },
      onError: (error: any) => {
        setState('error');
        setErrorMessage(error?.message || 'Failed to generate quiz');
      }
    })
  );
  
  const handleGenerateQuiz = () => {
    if (!content.trim()) {
      setErrorMessage('Please enter some content to generate a quiz from.');
      setState('error');
      return;
    }
    
    if (!address) {
      setErrorMessage('Please connect your wallet to generate a quiz.');
      setState('error');
      return;
    }
    
    setState('generating');
    
    // Generate quiz from content
    generateQuizMutation.mutate({ 
      content,
      userAddress: address,
      count: 5 // Generate 5 questions
    });
  };
  
  const handleViewQuiz = () => {
    if (quizId) {
      navigate({ to: '/quiz/$quizId', params: { quizId } });
    }
  };
  
  const handleTryAgain = () => {
    setState('inputting');
    setErrorMessage(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Quiz Generator</CardTitle>
        <CardDescription>
          Generate a quiz based on educational content
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state === 'inputting' && (
          <div className="space-y-4">
            <Textarea
              placeholder="Enter educational content to generate quiz questions from..."
              className="min-h-[200px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button 
              onClick={handleGenerateQuiz} 
              className="w-full"
            >
              Generate Quiz
            </Button>
          </div>
        )}
        
        {state === 'generating' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              Generating quiz questions from your content...
            </p>
          </div>
        )}
        
        {state === 'success' && (
          <div className="space-y-4">
            <div className="bg-primary/10 rounded-lg p-4 flex items-center space-x-3">
              <div className="bg-primary rounded-full p-1">
                <Check className="h-5 w-5 text-primary-foreground" />
              </div>
              <p>Quiz successfully generated!</p>
            </div>
            <Button 
              onClick={handleViewQuiz}
              className="w-full"
            >
              View Quiz <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
        
        {state === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Failed to generate quiz. Please try again.'}
            </AlertDescription>
            <Button 
              onClick={handleTryAgain}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
