// src/components/assessment/QuestionDisplay.tsx

import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { Question } from '../../types/assessment.types';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
  question, 
  questionNumber 
}) => {
  // Color based on difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Question {questionNumber}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={question.difficulty} 
              color={getDifficultyColor(question.difficulty)}
              size="small"
            />
            <Chip 
              label={question.concept} 
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
          {question.question_text}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
