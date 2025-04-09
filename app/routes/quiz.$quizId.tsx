import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTRPC } from '@/trpc/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

interface QuizData {
  quizData: {
    questions: QuizQuestion[];
  };
  noteContent: string;
  quizId: string;
  noteId: string;
}

export const Route = createFileRoute('/quiz/$quizId')({
  component: QuizDetailComponent,
});

function QuizDetailComponent() {
  const { quizId } = Route.useParams();
  const navigate = useNavigate();
  const trpc = useTRPC();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Fetch quiz data using the query hook from tRPC
  const { data, isLoading, isError, error } = useQuery(
    trpc.quiz.getQuizById.queryOptions({ quizId })
  );
  
  // Cast the data to our QuizData type
  const quizData = data as QuizData;

  const handleBackClick = () => {
    navigate({ to: '/quiz' });
  };

  const handleNextQuestion = () => {
    if (quizData && currentQuestion < quizData.quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleSelectAnswer = (option: string, index: number) => {
    const answerKey = String.fromCharCode(65 + index) as 'A' | 'B' | 'C' | 'D';
    setSelectedAnswer(answerKey);
    setShowExplanation(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={handleBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quiz Generator
        </Button>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={handleBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quiz Generator
        </Button>
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load quiz: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-4" onClick={handleBackClick}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Quiz Generator
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Educational Content</CardTitle>
              <CardDescription>The source material for this quiz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto p-1">
                <p className="whitespace-pre-wrap">{quizData.noteContent}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Question {currentQuestion + 1} of {quizData.quizData.questions.length}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePrevQuestion} 
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNextQuestion} 
                    disabled={currentQuestion === quizData.quizData.questions.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-lg font-medium">{quizData.quizData.questions[currentQuestion].question}</p>
              
              <div className="space-y-3">
                {quizData.quizData.questions[currentQuestion].options.map((option: string, index: number) => {
                  const answerKey = String.fromCharCode(65 + index);
                  const isCorrect = answerKey === quizData.quizData.questions[currentQuestion].answer;
                  const isSelected = answerKey === selectedAnswer;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleSelectAnswer(option, index)}
                      className={cn(
                        "p-3 border rounded-md cursor-pointer hover:bg-accent/50 transition-colors",
                        isSelected && isCorrect && "bg-green-100 border-green-500 dark:bg-green-900/20",
                        isSelected && !isCorrect && "bg-red-100 border-red-500 dark:bg-red-900/20"
                      )}
                    >
                      <span className="font-medium mr-2">{answerKey}.</span>
                      {option}
                    </div>
                  );
                })}
              </div>
              
              {showExplanation && (
                <>
                  <Separator />
                  <div className="p-4 bg-primary/5 rounded-md">
                    <h3 className="font-semibold mb-2">Explanation:</h3>
                    <p>{quizData.quizData.questions[currentQuestion].explanation}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
