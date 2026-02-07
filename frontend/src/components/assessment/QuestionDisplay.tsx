import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Paper } from '@mui/material';
import { Question } from '../../types/assessment.types';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
        return { bg: '#d4f4dd', color: '#2b8a3e', label: 'Easy' };
      case 'medium':
        return { bg: '#fff3bf', color: '#e67700', label: 'Medium' };
      case 'hard':
        return { bg: '#ffe0e0', color: '#c92a2a', label: 'Hard' };
      default:
        return { bg: '#e9ecef', color: '#495057', label: difficulty };
    }
  };

  const difficultyStyle = getDifficultyColor(question.difficulty);

  return (
    <Card 
      elevation={0}
      sx={{ 
        mb: 3,
        borderRadius: 3,
        border: '2px solid',
        borderColor: '#e9ecef',
        overflow: 'visible',
        position: 'relative',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
      }}
    >
      {/* Question number badge */}
      <Box
        sx={{
          position: 'absolute',
          top: -16,
          left: 24,
          bgcolor: 'primary.main',
          color: 'white',
          px: 3,
          py: 0.5,
          borderRadius: 2,
          fontWeight: 700,
          fontSize: '0.875rem',
          boxShadow: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        Question {questionNumber}
      </Box>

      <CardContent sx={{ pt: 4, pb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 1 }}>
          <Chip 
            label={difficultyStyle.label}
            sx={{
              bgcolor: difficultyStyle.bg,
              color: difficultyStyle.color,
              fontWeight: 600,
              fontSize: '0.813rem',
              height: 28
            }}
            size="small"
          />
          <Chip 
            label={question.concept}
            sx={{
              bgcolor: '#e8f0ff',
              color: '#667eea',
              fontWeight: 600,
              fontSize: '0.813rem',
              height: 28
            }}
            size="small"
          />
        </Box>
        
        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: 'white',
            borderRadius: 2,
            border: '1px solid #e9ecef'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <HelpOutlineIcon 
              sx={{ 
                color: '#667eea', 
                fontSize: 28,
                mt: 0.5,
                flexShrink: 0
              }} 
            />
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: '1.125rem', 
                lineHeight: 1.7,
                color: '#2c3e50',
                fontWeight: 400
              }}
            >
              {question.question_text}
            </Typography>
          </Box>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;