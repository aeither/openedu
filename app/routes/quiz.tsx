import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from '@/trpc/react';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useAccount } from "wagmi";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

interface QuizData {
  questions: QuizQuestion[];
  quizId?: string;
  noteId?: string;
}

export const Route = createFileRoute('/quiz')({
  head: () => ({
    meta: [{ title: 'Quiz Generator' }],
  }),
  component: QuizComponent,
});

function QuizComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [content, setContent] = useState('');
  const [count, setCount] = useState(4);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const generateQuizMutation = useMutation(
    trpc.quiz.generateQuiz.mutationOptions({
      onSuccess: (data: QuizData) => {
        console.log("🚀 ~ QuizComponent ~ data:", data)
        setQuizData(data);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        
        // Navigate to the quiz page if we have a quizId
        if (data.quizId) {
          // Use string concatenation for the path to avoid type errors
          navigate({ to: '/quiz/' + data.quizId, params: { quizId: data.quizId } });
        }
      },
      onError: (error: any) => {
        console.error('Error generating quiz:', error);
      }
    })
  );

  // Function to generate a quiz using tRPC
  const generateQuiz = async () => {
    if (!content || !address) {
      generateQuizMutation.reset();
      return;
    }

    setQuizData(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);

    generateQuizMutation.mutate({ 
      content, 
      count,
      userAddress: address
    });
  };

  const handleNextQuestion = () => {
    if (quizData && currentQuestion < quizData.questions.length - 1) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Quiz Generator</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate New Quiz</CardTitle>
          <CardDescription>Enter educational content to generate questions from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste or enter educational content to generate questions from"
                className="min-h-[150px]"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="count">Number of Questions</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                min={1}
                max={10}
              />
            </div>
            
            <Button 
              onClick={generateQuiz} 
              disabled={generateQuizMutation.isPending || !isConnected}
              className="w-full"
            >
              {generateQuizMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : !isConnected ? (
                'Connect Wallet to Generate Quiz'
              ) : (
                'Generate Quiz'
              )}
            </Button>
            
            {generateQuizMutation.isError && (
              <p className="text-destructive text-sm">
                {generateQuizMutation.error instanceof Error 
                  ? generateQuizMutation.error.message 
                  : 'Failed to generate quiz'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {quizData && quizData.questions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Question {currentQuestion + 1} of {quizData.questions.length}
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
                  disabled={currentQuestion === quizData.questions.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-lg font-medium">{quizData.questions[currentQuestion].question}</p>
            
            <div className="space-y-3">
              {quizData.questions[currentQuestion].options.map((option, index) => {
                const answerKey = String.fromCharCode(65 + index);
                const isCorrect = answerKey === quizData.questions[currentQuestion].answer;
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
                  <p>{quizData.questions[currentQuestion].explanation}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}