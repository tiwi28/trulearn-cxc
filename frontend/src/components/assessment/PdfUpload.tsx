import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Fade
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface PdfUploadProps {
  onFileUpload: (file: File) => void;
  label?: string;
  helperText?: string;
}

const PdfUpload: React.FC<PdfUploadProps> = ({ 
  onFileUpload,
  label = "Upload Study Material (PDF)",
  helperText = "This will be used as reference material to detect memorization"
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
    
    setUploading(true);
    setTimeout(() => {
      onFileUpload(file);
      setUploading(false);
    }, 1000);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {helperText}
      </Typography>

      {!selectedFile ? (
        <Paper 
          variant="outlined" 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            border: '3px dashed',
            borderColor: dragActive 
              ? 'primary.main' 
              : error 
                ? 'error.main' 
                : 'grey.300',
            bgcolor: dragActive 
              ? 'action.hover'
              : error 
                ? 'error.lighter' 
                : 'grey.50',
            cursor: 'pointer',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            transform: dragActive ? 'scale(1.02)' : 'scale(1)',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'primary.main',
              transform: 'scale(1.01)'
            }
          }}
        >
          <input
            accept="application/pdf"
            style={{ display: 'none' }}
            id="pdf-upload-button"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="pdf-upload-button">
            <Box sx={{ cursor: 'pointer' }}>
              <CloudUploadIcon 
                sx={{ 
                  fontSize: 72, 
                  color: dragActive ? 'primary.main' : 'grey.400',
                  mb: 2,
                  transition: 'all 0.3s ease'
                }} 
              />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                {dragActive ? 'Drop your PDF here' : 'Upload PDF Document'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Drag and drop your file here, or click to browse
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Maximum file size: 10MB • PDF format only
              </Typography>
            </Box>
          </label>
        </Paper>
      ) : (
        <Fade in timeout={500}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%)',
              border: '2px solid #667eea'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'white',
                    boxShadow: 1
                  }}
                >
                  <PictureAsPdfIcon sx={{ fontSize: 36, color: '#e53e3e' }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    {selectedFile.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(selectedFile.size)}
                    </Typography>
                    {!uploading && (
                      <>
                        <Typography variant="caption" color="text.secondary">•</Typography>
                        <CheckCircleIcon sx={{ fontSize: 16, color: '#51cf66' }} />
                        <Typography variant="caption" sx={{ color: '#51cf66', fontWeight: 600 }}>
                          Ready
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {!uploading && (
                  <Chip 
                    label="Uploaded" 
                    sx={{
                      bgcolor: '#51cf66',
                      color: 'white',
                      fontWeight: 600
                    }}
                    size="small" 
                  />
                )}
                <IconButton 
                  onClick={handleRemoveFile}
                  sx={{
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.lighter'
                    }
                  }}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            
            {uploading && (
              <Box sx={{ mt: 2 }}>
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
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ mt: 1, display: 'block', textAlign: 'center' }}
                >
                  Processing PDF...
                </Typography>
              </Box>
            )}
          </Paper>
        </Fade>
      )}

      {error && (
        <Fade in>
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              borderRadius: 2
            }}
          >
            {error}
          </Alert>
        </Fade>
      )}
    </Box>
  );
};

export default PdfUpload;