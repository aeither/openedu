import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createFileRoute } from '@tanstack/react-router';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

interface QuizData {
  questions: QuizQuestion[];
}

export const Route = createFileRoute('/quiz')({
  head: () => ({
    meta: [{ title: 'Quiz Generator' }],
  }),
  component: QuizComponent,
});

function QuizComponent() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Function to generate a quiz using the API endpoint
  const generateQuiz = async () => {
    if (!topic) {
      setError('Please enter a topic');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuizData(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);

    try {
      // Call the API endpoint
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          count
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate quiz');
      }

      const result = await response.json();

      // Set the result as the quiz data
      setQuizData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
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
          <CardDescription>Enter a topic to generate questions about</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic (e.g., Quantum Physics, Climate Change)"
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
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                'Generate Quiz'
              )}
            </Button>
            
            {error && <p className="text-destructive text-sm">{error}</p>}
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