import React from 'react';

interface CenteredToastProps {
  message: string;
  open: boolean;
  onClose: () => void;
  duration?: number; // ms
}

const CenteredToast: React.FC<CenteredToastProps> = ({ message, open, onClose, duration = 2200 }) => {
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(34, 197, 94, 0.97)', // green-500
          color: 'white',
          padding: '1.5rem 2.5rem',
          borderRadius: '1rem',
          fontWeight: 600,
          fontSize: '1.25rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          pointerEvents: 'auto',
          textAlign: 'center',
          minWidth: '220px',
        }}
        role="alert"
        aria-live="assertive"
      >
        {message}
      </div>
    </div>
  );
};

export default CenteredToast;
