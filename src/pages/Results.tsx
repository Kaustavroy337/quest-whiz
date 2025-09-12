import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Award, BarChart3, Home } from 'lucide-react';

interface ResultsState {
  scores: {
    aptitude: number;
    product: number;
    kra: number;
    total: number;
  };
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState;

  // Redirect if no scores available
  if (!state?.scores) {
    navigate('/landing');
    return null;
  }

  const { scores } = state;
  const percentage = Math.round((scores.total / 30) * 100);

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'bg-green-500' };
    if (percentage >= 70) return { grade: 'B', color: 'bg-blue-500' };
    if (percentage >= 60) return { grade: 'C', color: 'bg-yellow-500' };
    if (percentage >= 50) return { grade: 'D', color: 'bg-orange-500' };
    return { grade: 'F', color: 'bg-red-500' };
  };

  const grade = getGrade(percentage);

  const sections = [
    {
      name: 'Aptitude',
      score: scores.aptitude,
      total: 10,
      color: 'bg-primary',
    },
    {
      name: 'Product Knowledge',
      score: scores.product,
      total: 10,
      color: 'bg-secondary',
    },
    {
      name: 'KRA Knowledge',
      score: scores.kra,
      total: 10,
      color: 'bg-accent',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="mb-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-600 mb-2">Test Completed!</h1>
            <p className="text-muted-foreground">Thank you for completing the assessment</p>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Award className="h-6 w-6" />
              Overall Result
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-6xl font-bold text-primary">
                {scores.total}<span className="text-3xl text-muted-foreground">/30</span>
              </div>
              <div className="text-2xl font-semibold text-muted-foreground">
                {percentage}%
              </div>
              <Badge className={`${grade.color} text-white text-lg px-4 py-1`}>
                Grade: {grade.grade}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Section-wise Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Section-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.map((section) => {
              const sectionPercentage = (section.score / section.total) * 100;
              return (
                <div key={section.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{section.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {section.score}/{section.total}
                      </span>
                      <Badge variant="outline">
                        {Math.round(sectionPercentage)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${section.color}`}
                      style={{ width: `${sectionPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {percentage >= 80 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">Excellent Performance!</p>
                  <p className="text-green-700 text-sm">You have demonstrated strong knowledge across all areas.</p>
                </div>
              )}
              
              {percentage >= 60 && percentage < 80 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium">Good Performance!</p>
                  <p className="text-blue-700 text-sm">You have shown good understanding with room for improvement.</p>
                </div>
              )}
              
              {percentage < 60 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 font-medium">Needs Improvement</p>
                  <p className="text-orange-700 text-sm">Consider reviewing the study materials and retaking the test.</p>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>• Your results have been recorded and will be reviewed by your supervisor</p>
                <p>• You may retake the test if permitted by your administrator</p>
                <p>• For questions about your results, please contact HR</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate('/landing')} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;