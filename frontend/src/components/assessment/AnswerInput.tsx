// src/components/assessment/AnswerInput.tsx

import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, LinearProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

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

    const responseTime = Math.floor((Date.now() - startTime) / 1000); // seconds
    onSubmit(answerText, responseTime);
    
    // Optionally clear the textarea after submit
    // setAnswerText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Your Answer
      </Typography>
      
      <TextField
        fullWidth
        multiline
        rows={8}
        variant="outlined"
        placeholder="Type your answer here..."
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={disabled || isSubmitting}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {charCount} characters • Press Ctrl+Enter to submit
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleSubmit}
          disabled={disabled || isSubmitting || answerText.trim().length === 0}
          size="large"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </Button>
      </Box>

      {isSubmitting && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Analyzing your answer...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AnswerInput;
