import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, LinearProgress, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EditNoteIcon from '@mui/icons-material/EditNote';

interface AnswerInputProps {
  onSubmit: (answerText: string, responseTime: number) => void;
  disabled?: boolean;
  isSubmitting?: boolean;
}

const AnswerInput: React.FC<AnswerInputProps> = ({ 
  onSubmit, 
  disabled = false,
  isSubmitting = false 
}) => {
  const [answerText, setAnswerText] = useState('');
  const [startTime] = useState(Date.now());
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(answerText.length);
  }, [answerText]);

  const handleSubmit = () => {
    if (answerText.trim().length === 0) {
      alert('Please enter an answer before submitting.');
      return;
    }

    const responseTime = Math.floor((Date.now() - startTime) / 1000);
    onSubmit(answerText, responseTime);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getCharCountColor = () => {
    if (charCount === 0) return 'text.secondary';
    if (charCount < 50) return 'warning.main';
    return 'success.main';
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <EditNoteIcon sx={{ color: '#667eea', fontSize: 28 }} />
        <Typography variant="h6" fontWeight={600}>
          Your Answer
        </Typography>
      </Box>
      
      <Paper
        elevation={0}
        sx={{
          p: 0,
          border: '2px solid',
          borderColor: answerText.length > 0 ? '#667eea' : '#e9ecef',
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:focus-within': {
            borderColor: '#667eea',
            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
          }
        }}
      >
        <TextField
          fullWidth
          multiline
          rows={8}
          variant="outlined"
          placeholder="Express your understanding in your own words..."
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled || isSubmitting}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: 'none'
              }
            },
            '& .MuiInputBase-input': {
              fontSize: '1rem',
              lineHeight: 1.6,
              p: 2
            }
          }}
        />
      </Paper>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: getCharCountColor(),
              fontWeight: 500
            }}
          >
            {charCount} characters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            •
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {charCount < 50 ? 'Write at least 50 characters for a thorough answer' : 'Great! Keep going'}
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSubmit}
          disabled={disabled || isSubmitting || answerText.trim().length === 0}
          size="large"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #653a8a 100%)',
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-1px)'
            },
            '&:disabled': {
              background: '#e9ecef',
              color: '#adb5bd',
              boxShadow: 'none'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {isSubmitting ? 'Analyzing...' : 'Submit Answer'}
        </Button>
      </Box>

      {isSubmitting && (
        <Box sx={{ mt: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%)',
              border: '1px solid #667eea'
            }}
          >
            <LinearProgress 
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'rgba(102, 126, 234, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                }
              }}
            />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mt: 2, textAlign: 'center', fontWeight: 500 }}
            >
              🧠 Analyzing your answer with AI...
            </Typography>
          </Paper>
        </Box>
      )}

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          💡 Tip: Press <Box component="span" sx={{ fontWeight: 600, color: '#667eea' }}>Ctrl+Enter</Box> to submit quickly
        </Typography>
      </Box>
    </Box>
  );
};

export default AnswerInput;