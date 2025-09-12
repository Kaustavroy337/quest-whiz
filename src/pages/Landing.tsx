import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, BookOpen, Target, Award } from 'lucide-react';

const Landing = () => {
  const { employee, logout } = useAuth();
  const navigate = useNavigate();

  const handleStartTest = () => {
    if (!employee?.can_attempt) {
      return;
    }
    navigate('/test');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8 pt-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {employee?.username}!</h1>
            <p className="text-muted-foreground">Employee Assessment Portal</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Test Instructions
              </CardTitle>
              <CardDescription>Please read carefully before starting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Test Structure:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 3 sections: Aptitude, Product Knowledge, KRA Knowledge</li>
                  <li>• 10 random questions per section (30 total)</li>
                  <li>• Multiple choice questions (A, B, C, D)</li>
                  <li>• One question displayed at a time</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Limit:
                </h4>
                <p className="text-sm text-muted-foreground">30 minutes total for all sections</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Important Notes:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• You can navigate between questions using Next/Previous</li>
                  <li>• Your answers are automatically saved</li>
                  <li>• Submit before time runs out</li>
                  <li>• Results will be shown immediately after submission</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Test Sections
              </CardTitle>
              <CardDescription>Overview of assessment areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/5 border">
                  <h4 className="font-semibold text-primary">Aptitude (10 questions)</h4>
                  <p className="text-sm text-muted-foreground">Logical reasoning, numerical ability, and problem-solving skills</p>
                </div>

                <div className="p-3 rounded-lg bg-secondary/5 border">
                  <h4 className="font-semibold text-secondary">Product Knowledge (10 questions)</h4>
                  <p className="text-sm text-muted-foreground">Understanding of company products, features, and market position</p>
                </div>

                <div className="p-3 rounded-lg bg-accent/5 border">
                  <h4 className="font-semibold text-accent">KRA Knowledge (10 questions)</h4>
                  <p className="text-sm text-muted-foreground">Key Responsibility Areas and performance metrics</p>
                </div>
              </div>

              <div className="pt-4">
                {employee?.can_attempt ? (
                  <Button 
                    onClick={handleStartTest} 
                    className="w-full" 
                    size="lg"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Start Test
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <p className="text-destructive font-medium">Test Access Restricted</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please contact your supervisor to enable test access.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;