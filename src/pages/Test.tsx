import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Question {
  id: string;
  section: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

interface TestAnswer {
  questionId: string;
  selectedOption: string;
  section: string;
}

const Test = () => {
  const { employee } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not logged in or can't attempt
  useEffect(() => {
    if (!employee) {
      navigate('/login');
      return;
    }
    if (!employee.can_attempt) {
      navigate('/landing');
      return;
    }
  }, [employee, navigate]);

  // Load random questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const sections = ['aptitude', 'product_knowledge', 'kra_knowledge'];
        const allQuestions: Question[] = [];

        for (const section of sections) {
          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('section', section)
            .limit(1000);

          if (error) throw error;

          // Shuffle and take 10 random questions
          const shuffled = data.sort(() => 0.5 - Math.random());
          allQuestions.push(...shuffled.slice(0, 10));
        }

        setQuestions(allQuestions);
        setLoading(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load questions",
          variant: "destructive",
        });
        navigate('/landing');
      }
    };

    loadQuestions();
  }, [navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerSelect = (option: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswer: TestAnswer = {
      questionId: currentQuestion.id,
      selectedOption: option,
      section: currentQuestion.section,
    };

    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion.id);
      return [...filtered, newAnswer];
    });
  };

  const getCurrentAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    return answers.find(a => a.questionId === currentQuestion.id)?.selectedOption || '';
  };

  const calculateScores = () => {
    const scores = {
      aptitude: 0,
      product_knowledge: 0,
      kra_knowledge: 0,
    };

    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question && question.correct_option === answer.selectedOption) {
        scores[answer.section as keyof typeof scores]++;
      }
    });

    return scores;
  };

  const handleSubmit = async () => {
    if (!employee) return;
    
    setSubmitting(true);
    
    try {
      const scores = calculateScores();
      const totalScore = scores.aptitude + scores.product_knowledge + scores.kra_knowledge;

      const { error } = await supabase
        .from('attempts')
        .insert({
          employee_id: employee.id,
          aptitude_score: scores.aptitude,
          product_score: scores.product_knowledge,
          kra_score: scores.kra_knowledge,
          total_score: totalScore,
          answers: JSON.parse(JSON.stringify(answers)),
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Navigate to results with scores
      navigate('/results', { 
        state: { 
          scores: {
            aptitude: scores.aptitude,
            product: scores.product_knowledge,
            kra: scores.kra_knowledge,
            total: totalScore,
          }
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit test",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSectionName = (section: string) => {
    switch (section) {
      case 'aptitude': return 'Aptitude';
      case 'product_knowledge': return 'Product Knowledge';
      case 'kra_knowledge': return 'KRA Knowledge';
      default: return section;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>No questions available. Please contact your administrator.</p>
            <Button onClick={() => navigate('/landing')} className="mt-4">
              Back to Landing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Employee Assessment</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length} • {getSectionName(currentQuestion.section)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-lg font-mono bg-card p-3 rounded-lg border">
            <Clock className="h-5 w-5" />
            <span className={timeLeft <= 300 ? 'text-destructive' : 'text-foreground'}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed">
              {currentQuestion.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'A', text: currentQuestion.option_a },
              { key: 'B', text: currentQuestion.option_b },
              { key: 'C', text: currentQuestion.option_c },
              { key: 'D', text: currentQuestion.option_d },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => handleAnswerSelect(option.key)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  getCurrentAnswer() === option.key
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <span className="font-medium mr-3">{option.key}.</span>
                {option.text}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {answers.length} of {questions.length} answered
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Test;