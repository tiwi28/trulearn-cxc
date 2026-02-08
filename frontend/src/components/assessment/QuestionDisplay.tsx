import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Question {
  id: number;
  type: 'multiple_choice' | 'open_ended';
  question: string;
  concept: string;
  difficulty: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer?: string;
  sample_answer?: string;
  is_variation?: boolean;
}

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onSelectAnswer?: (answer: string) => void;
  showCorrectAnswer?: boolean;
  isAnswered?: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showCorrectAnswer = false,
  isAnswered = false
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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
        borderColor: isAnswered ? '#51cf66' : '#e0e0e0',
        overflow: 'visible',
        position: 'relative',
        background: '#fff',
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent sx={{ pt: 3, pb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 1, flexWrap: 'wrap' }}>
          {/* Question number badge */}
          <Box
            sx={{
              bgcolor: isAnswered ? '#51cf66' : '#AEE0F9',
              color: isAnswered ? 'white' : '#1a1a1a',
              px: 2.5,
              py: 0.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              height: 32
            }}
          >
            {isAnswered && <CheckCircleIcon sx={{ fontSize: 18 }} />}
            Question {questionNumber}/{totalQuestions}
          </Box>

          {/* Difficulty chip */}
          <Chip
            label={difficultyStyle.label}
            sx={{
              bgcolor: difficultyStyle.bg,
              color: difficultyStyle.color,
              fontWeight: 600,
              fontSize: '0.813rem',
              height: 32
            }}
            size="small"
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: '#fafafa',
            borderRadius: 2,
            border: '1px solid #e9ecef'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: question.type === 'multiple_choice' ? 3 : 0 }}>
            <HelpOutlineIcon
              sx={{
                color: '#AEE0F9',
                fontSize: 28,
                mt: 0.5,
                flexShrink: 0
              }}
            />
            <Typography
              variant="body1"
              sx={{
                fontSize: '1.05rem',
                lineHeight: 1.7,
                color: '#2c3e50',
                fontWeight: 500
              }}
            >
              {question.question}
            </Typography>
          </Box>

          {/* Multiple Choice Options */}
          {question.type === 'multiple_choice' && question.options && (
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={selectedAnswer || ''}
                onChange={(e) => onSelectAnswer && onSelectAnswer(e.target.value)}
              >
                {Object.entries(question.options).map(([key, value]) => {
                  const isCorrect = showCorrectAnswer && key === question.correct_answer;
                  const isSelected = selectedAnswer === key;
                  const isWrong = showCorrectAnswer && isSelected && key !== question.correct_answer;

                  return (
                    <Paper
                      key={key}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        border: '2px solid',
                        borderColor: isCorrect
                          ? '#51cf66'
                          : isWrong
                            ? '#ff6b6b'
                            : isSelected
                              ? '#AEE0F9'
                              : '#e9ecef',
                        borderRadius: 2,
                        bgcolor: isCorrect
                          ? 'rgba(81, 207, 102, 0.1)'
                          : isWrong
                            ? 'rgba(255, 107, 107, 0.1)'
                            : isSelected
                              ? 'rgba(174, 224, 249, 0.05)'
                              : 'white',
                        transition: 'all 0.2s ease',
                        cursor: showCorrectAnswer ? 'default' : 'pointer',
                        '&:hover': !showCorrectAnswer ? {
                          borderColor: '#AEE0F9',
                          bgcolor: 'rgba(174, 224, 249, 0.05)',
                        } : {}
                      }}
                    >
                      <FormControlLabel
                        value={key}
                        control={
                          <Radio
                            sx={{
                              color: isCorrect ? '#51cf66' : isWrong ? '#ff6b6b' : undefined
                            }}
                            disabled={showCorrectAnswer}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Box
                              sx={{
                                minWidth: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: isCorrect
                                  ? '#51cf66'
                                  : isWrong
                                    ? '#ff6b6b'
                                    : isSelected
                                      ? '#AEE0F9'
                                      : '#e9ecef',
                                color: isSelected || isCorrect || isWrong ? 'white' : '#6c757d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {key}
                            </Box>
                            <Typography
                              sx={{
                                fontSize: '0.95rem',
                                color: '#2c3e50',
                                flex: 1
                              }}
                            >
                              {value}
                            </Typography>
                            {isCorrect && showCorrectAnswer && (
                              <CheckCircleIcon sx={{ color: '#51cf66', fontSize: 22 }} />
                            )}
                          </Box>
                        }
                        sx={{
                          m: 0,
                          width: '100%'
                        }}
                      />
                    </Paper>
                  );
                })}
              </RadioGroup>
            </FormControl>
          )}
        </Paper>
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;