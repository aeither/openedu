import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTRPC } from '@/trpc/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle, BookOpen, CheckCircle2, RefreshCw, Trophy } from 'lucide-react';
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
  const [showEducationalContent, setShowEducationalContent] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Fetch quiz data using the query hook from tRPC
  const { data, isLoading, isError, error } = useQuery(
    trpc.quiz.getQuizById.queryOptions({ quizId })
  );
  
  // Cast the data to our QuizData type if it exists
  const quizData = data as QuizData | undefined;

  // Initialize the correctAnswers array when quiz data is loaded
  useEffect(() => {
    if (quizData && quizData.quizData.questions) {
      setCorrectAnswers(new Array(quizData.quizData.questions.length).fill(false));
    }
  }, [quizData]);

  const handleBackClick = () => {
    navigate({ to: '/quiz' });
  };

  const handleNextQuestion = () => {
    if (!quizData) return;
    
    // Update the correctAnswers array for the current question
    if (selectedAnswer === quizData.quizData.questions[currentQuestion].answer) {
      const newCorrectAnswers = [...correctAnswers];
      newCorrectAnswers[currentQuestion] = true;
      setCorrectAnswers(newCorrectAnswers);
    }
    
    if (currentQuestion < quizData.quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz completed
      setQuizCompleted(true);
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
    if (!quizData) return;
    
    const answerKey = String.fromCharCode(65 + index) as 'A' | 'B' | 'C' | 'D';
    setSelectedAnswer(answerKey);
    setShowExplanation(true);
  };

  const toggleEducationalContent = () => {
    setShowEducationalContent(!showEducationalContent);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCorrectAnswers(new Array(quizData?.quizData.questions.length || 0).fill(false));
    setQuizCompleted(false);
  };

  const handleNewQuiz = () => {
    navigate({ to: '/quiz' });
  };

  // Check if the current answer is correct
  const isCurrentAnswerCorrect = () => {
    if (!quizData || selectedAnswer === null) return false;
    return selectedAnswer === quizData.quizData.questions[currentQuestion].answer;
  };

  // Calculate score
  const calculateScore = () => {
    const correct = correctAnswers.filter(Boolean).length;
    const total = correctAnswers.length;
    return { correct, total, percentage: Math.round((correct / total) * 100) };
  };

  // Page header with back button - used in all states
  const PageHeader = () => (
    <Button variant="ghost" className="mb-4" onClick={handleBackClick}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Quiz Generator
    </Button>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        
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

  // If there's an error OR the quiz doesn't exist
  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        
        <Card className="border-destructive">
          <CardHeader className="bg-destructive/5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Quiz Not Found</CardTitle>
            </div>
            <CardDescription>
              The quiz you're looking for doesn't exist or couldn't be loaded.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">
              {error instanceof Error ? error.message : 'The requested quiz could not be found.'}
            </p>
            <Button onClick={handleBackClick} className="w-full">
              Go to Quiz Generator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Make sure quizData exists and has questions
  if (!quizData || !quizData.quizData || !quizData.quizData.questions || quizData.quizData.questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        
        <Card className="border-warning">
          <CardHeader className="bg-warning/5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <CardTitle>Invalid Quiz Data</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">
              This quiz has invalid or missing question data. Please try generating a new quiz.
            </p>
            <Button onClick={handleBackClick} className="w-full">
              Go to Quiz Generator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show congratulations screen if quiz is completed
  if (quizCompleted) {
    const { correct, total, percentage } = calculateScore();
    
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        
        <Card className="border-primary">
          <CardHeader className="bg-primary/5 text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
            <CardDescription>
              Congratulations on completing the quiz
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold mb-2">{percentage}%</div>
            <p className="text-lg mb-6">You got {correct} out of {total} questions correct</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button 
                onClick={handleNewQuiz}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Generate New Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader />
      
      <div className="space-y-6">
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
                  disabled={!isCurrentAnswerCorrect() || !showExplanation}
                >
                  {currentQuestion === quizData.quizData.questions.length - 1 ? "Finish Quiz" : "Next"}
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
                      isSelected && !isCorrect && "bg-red-100 border-red-500 dark:bg-red-900/20",
                      showExplanation && isCorrect && !isSelected && "border-green-500 dark:border-green-500/50"
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
                <div className={cn(
                  "p-4 rounded-md",
                  isCurrentAnswerCorrect() ? "bg-green-50 dark:bg-green-900/10" : "bg-red-50 dark:bg-red-900/10"
                )}>
                  <h3 className="font-semibold mb-2">
                    {isCurrentAnswerCorrect() 
                      ? "Correct!" 
                      : `Incorrect. The correct answer is ${quizData.quizData.questions[currentQuestion].answer}.`}
                  </h3>
                  <p>{quizData.quizData.questions[currentQuestion].explanation}</p>
                </div>
                
                {!isCurrentAnswerCorrect() && (
                  <div className="text-center mt-4 text-sm text-muted-foreground">
                    You need to select the correct answer to proceed to the next question.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/10 transition-colors" 
            onClick={toggleEducationalContent}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <h3 className="text-lg font-medium">Educational Content</h3>
            </div>
            <div className={`transform transition-transform ${showEducationalContent ? 'rotate-180' : ''}`}>
              <ArrowLeft className="rotate-90 h-4 w-4" />
            </div>
          </div>
          
          {showEducationalContent && (
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto p-3 whitespace-pre-wrap">
                {quizData.noteContent}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
