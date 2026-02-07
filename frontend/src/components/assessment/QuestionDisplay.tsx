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
  FormControl,
  Badge
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import EditNoteIcon from '@mui/icons-material/EditNote';

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
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
  question, 
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showCorrectAnswer = false
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

  // Type-specific styling
  const getTypeStyle = () => {
    if (question.type === 'multiple_choice') {
      return {
        bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        borderColor: '#1976d2',
        icon: <QuizIcon sx={{ fontSize: 20 }} />,
        label: 'Multiple Choice',
        color: '#1976d2'
      };
    } else {
      return {
        bg: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
        borderColor: '#7b1fa2',
        icon: <EditNoteIcon sx={{ fontSize: 20 }} />,
        label: 'Open Response',
        color: '#7b1fa2'
      };
    }
  };

  const typeStyle = getTypeStyle();

  return (
    <Card 
      elevation={0}
      sx={{ 
        mb: 3,
        borderRadius: 3,
        border: '3px solid',
        borderColor: typeStyle.borderColor,
        overflow: 'visible',
        position: 'relative',
        background: typeStyle.bg,
        transition: 'all 0.3s ease'
      }}
    >
      {/* Question number badge with type indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: 24,
          display: 'flex',
          gap: 1,
          alignItems: 'center'
        }}
      >
        <Badge
          badgeContent={question.is_variation ? '🔄' : null}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '1rem',
              right: -5,
              top: 5
            }
          }}
        >
          <Box
            sx={{
              bgcolor: typeStyle.borderColor,
              color: 'white',
              px: 3,
              py: 0.75,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: '0.875rem',
              boxShadow: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {typeStyle.icon}
            Question {questionNumber}/{totalQuestions}
          </Box>
        </Badge>
        
        {question.is_variation && (
          <Chip
            label="Practice Variation"
            size="small"
            sx={{
              bgcolor: '#ff9800',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
        )}
      </Box>

      <CardContent sx={{ pt: 5, pb: 3 }}>
        {/* Type indicator - faded background label */}
        <Box
          sx={{
            position: 'absolute',
            top: 24,
            right: 24,
            opacity: 0.15,
            fontSize: '4rem',
            fontWeight: 900,
            color: typeStyle.color,
            pointerEvents: 'none',
            userSelect: 'none',
            letterSpacing: '-0.05em'
          }}
        >
          {question.type === 'multiple_choice' ? 'MC' : 'OR'}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={typeStyle.label}
            icon={typeStyle.icon}
            sx={{
              bgcolor: 'white',
              border: '2px solid',
              borderColor: typeStyle.borderColor,
              color: typeStyle.color,
              fontWeight: 600,
              fontSize: '0.813rem',
              height: 32,
              '& .MuiChip-icon': {
                color: typeStyle.color
              }
            }}
            size="small"
          />
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
          <Chip 
            label={question.concept}
            sx={{
              bgcolor: 'white',
              border: '2px solid #667eea',
              color: '#667eea',
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
            bgcolor: 'white',
            borderRadius: 2,
            border: '2px solid',
            borderColor: typeStyle.borderColor
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
            <HelpOutlineIcon 
              sx={{ 
                color: typeStyle.borderColor, 
                fontSize: 32,
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
                        p: 2,
                        mb: 1.5,
                        border: '2px solid',
                        borderColor: isCorrect 
                          ? '#51cf66' 
                          : isWrong 
                            ? '#ff6b6b'
                            : isSelected
                              ? '#667eea'
                              : '#e9ecef',
                        borderRadius: 2,
                        bgcolor: isCorrect
                          ? 'rgba(81, 207, 102, 0.1)'
                          : isWrong
                            ? 'rgba(255, 107, 107, 0.1)'
                            : isSelected
                              ? 'rgba(102, 126, 234, 0.05)'
                              : 'transparent',
                        transition: 'all 0.2s ease',
                        cursor: showCorrectAnswer ? 'default' : 'pointer',
                        '&:hover': !showCorrectAnswer ? {
                          borderColor: '#667eea',
                          bgcolor: 'rgba(102, 126, 234, 0.05)',
                          transform: 'translateX(4px)'
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
                                minWidth: 36,
                                height: 36,
                                borderRadius: '50%',
                                bgcolor: isCorrect 
                                  ? '#51cf66'
                                  : isWrong
                                    ? '#ff6b6b'
                                    : isSelected
                                      ? '#667eea'
                                      : '#e9ecef',
                                color: isSelected || isCorrect || isWrong ? 'white' : '#6c757d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {key}
                            </Box>
                            <Typography 
                              sx={{ 
                                fontSize: '1rem',
                                color: '#2c3e50',
                                flex: 1
                              }}
                            >
                              {value}
                            </Typography>
                            {isCorrect && showCorrectAnswer && (
                              <CheckCircleIcon sx={{ color: '#51cf66', fontSize: 24 }} />
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

          {/* Open-Ended Question Note */}
          {question.type === 'open_ended' && (
            <Box sx={{ 
              mt: 2, 
              p: 2.5, 
              bgcolor: 'rgba(123, 31, 162, 0.08)', 
              borderRadius: 2,
              border: '2px solid rgba(123, 31, 162, 0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EditNoteIcon sx={{ color: '#7b1fa2', fontSize: 24 }} />
                <Typography variant="subtitle2" fontWeight={600} color="#7b1fa2">
                  Open Response Question
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Write a 2-3 sentence answer explaining the concept in your own words. 
                Avoid copying directly from your notes.
              </Typography>
            </Box>
          )}
        </Paper>
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;