import React, { useEffect, useState } from 'react';
import { Alert, Snackbar, AlertColor } from '@mui/material';
import { CheckCircle, Warning, Error } from '@mui/icons-material';

interface AlertBoxProps {
  open: boolean;
  type: 'success' | 'warning' | 'error';
  message: string;
  onClose: () => void;
}

export default function AlertBox({ open, type, message, onClose }: AlertBoxProps) {
  const [autoHideDuration, setAutoHideDuration] = useState<number | null>(null);

  console.log('🎭 AlertBox render:', { open, type, message, autoHideDuration });

  useEffect(() => {
    console.log('🎭 AlertBox useEffect triggered:', { open, type });
    if (open) {
      switch (type) {
        case 'success':
          setAutoHideDuration(2000); // 2 seconds
          break;
        case 'warning':
          setAutoHideDuration(3000); // 3 seconds
          break;
        case 'error':
          setAutoHideDuration(null); // No auto-hide for errors
          break;
      }
    }
  }, [open, type]);

  const getAlertProps = () => {
    switch (type) {
      case 'success':
        return {
          severity: 'success' as AlertColor,
          icon: <CheckCircle />,
          sx: {
            backgroundColor: '#4caf50',
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' },
          }
        };
      case 'warning':
        return {
          severity: 'warning' as AlertColor,
          icon: <Warning />,
          sx: {
            backgroundColor: '#ff9800',
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' },
          }
        };
      case 'error':
        return {
          severity: 'error' as AlertColor,
          icon: <Error />,
          sx: {
            backgroundColor: '#f44336',
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' },
          }
        };
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbar-root': {
          top: 24,
          right: 24,
        }
      }}
    >
      <Alert
        onClose={onClose}
        {...getAlertProps()}
        variant="filled"
        elevation={6}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
