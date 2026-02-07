import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Alert,
  LinearProgress,
  Chip,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
    
    // Simulate upload (you'll replace this with actual API call)
    setUploading(true);
    setTimeout(() => {
      onFileUpload(file);
      setUploading(false);
    }, 1000);
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
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {helperText}
      </Typography>

      {!selectedFile ? (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            border: '2px dashed',
            borderColor: error ? 'error.main' : 'primary.main',
            bgcolor: error ? 'error.light' : 'background.paper',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <input
            accept="application/pdf"
            style={{ display: 'none' }}
            id="pdf-upload-button"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="pdf-upload-button">
            <Box sx={{ cursor: 'pointer' }}>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                Click to upload PDF
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Maximum file size: 10MB
              </Typography>
            </Box>
          </label>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PictureAsPdfIcon sx={{ fontSize: 40, color: 'error.main' }} />
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="Uploaded" 
                color="success" 
                size="small" 
              />
              <IconButton 
                onClick={handleRemoveFile}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Processing PDF...
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default PdfUpload;