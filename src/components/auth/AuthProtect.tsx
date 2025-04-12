import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/auth/LoginModal';

interface AuthProtectProps {
  children: ReactNode;
  fallback?: ReactNode;
  loginPrompt?: boolean;
}

/**
 * AuthProtect component
 * Wrapper that protects content to only show for logged-in users
 * 
 * @example
 * // Basic usage - hide content completely for non-logged in users
 * <AuthProtect>
 *   <SensitiveContent />
 * </AuthProtect>
 * 
 * @example
 * // With custom fallback content
 * <AuthProtect fallback={<p>Please log in to view this content</p>}>
 *   <SensitiveContent />
 * </AuthProtect>
 * 
 * @example
 * // With login prompt
 * <AuthProtect loginPrompt>
 *   <SensitiveContent />
 * </AuthProtect>
 */
const AuthProtect: React.FC<AuthProtectProps> = ({
  children,
  fallback = null,
  loginPrompt = false,
}) => {
  const { isAuthenticated, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  // If still loading auth state, you can show a loading indicator or nothing
  if (loading) {
    return null; // Or return a loading spinner
  }

  // If authenticated, show the protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and login prompt is enabled, show login modal
  if (loginPrompt && !showLoginModal) {
    // Show login modal on first render
    React.useEffect(() => {
      setShowLoginModal(true);
    }, []);
  }

  // Render fallback content or null if not authenticated
  return (
    <>
      {fallback}
      
      {loginPrompt && (
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      )}
    </>
  );
};

/**
 * Wrapper component that shows content only for non-authenticated users
 */
export const GuestOnly: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({
  children,
  fallback = null,
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default AuthProtect;
