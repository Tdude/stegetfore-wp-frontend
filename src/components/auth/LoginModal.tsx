// src/components/auth/LoginModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import LoadingDots from '@/components/ui/LoadingDots';
import { ExternalLink } from 'lucide-react';
import { getWpAdminUrl, canAccessWpAdmin } from '@/lib/utils/wpAdmin';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// How long the success message stays before the modal auto-closes (ms).
// Admins/editors are exempt — their modal stays open for the wp-admin link.
const AUTO_CLOSE_DELAY_MS = 6000;

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  // Whether to surface the wp-admin link (administrators/editors only).
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { login, devLogin } = useAuth();

  // Check if in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Reset transient success state on close so a reopened modal starts clean.
  const handleClose = () => {
    setSuccess(false);
    setShowAdminLink(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setShowAdminLink(false);

    try {
      const result = await login(username, password, rememberMe);
      if (result.success) {
        // Show success message
        setSuccess(true);
        // Reset form
        setUsername('');
        setPassword('');
        // Keep the modal open for admins/editors so the wp-admin link stays
        // usable; auto-close for everyone else after a short delay.
        if (canAccessWpAdmin(result.data?.roles)) {
          setShowAdminLink(true);
        } else {
          setTimeout(() => {
            handleClose();
          }, AUTO_CLOSE_DELAY_MS);
        }
      } else {
        setError(result.error ? String(result.error) : 'Inloggningen misslyckades. Kontrollera dina uppgifter.');
      }
    } catch (error) {
      // Log error and show detailed message if available
      console.error('Login error:', error);
      setError(`Ett fel uppstod vid inloggning: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    setShowAdminLink(false);

    try {
      const result = await devLogin(rememberMe);
      if (result.success) {
        // Show success message
        setSuccess(true);
        // Keep the modal open for admins/editors so the wp-admin link stays
        // usable; auto-close for everyone else after a short delay.
        if (canAccessWpAdmin(result.data?.roles)) {
          setShowAdminLink(true);
        } else {
          setTimeout(() => {
            handleClose();
          }, AUTO_CLOSE_DELAY_MS);
        }
      } else {
        setError(result.error ? String(result.error) : 'Dev-inloggning misslyckades. Kontrollera .env.local filen.');
      }
    } catch (error) {
      // Log error details for debugging
      console.error('Dev login error:', error);
      setError(`Ett fel uppstod vid dev-inloggning: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Logga in</DialogTitle>
          <DialogDescription>
            Ange dina inloggningsuppgifter nedan för att logga in på ditt konto.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
              <p className="text-green-700">Du är inloggad</p>
              {showAdminLink && (
                <a
                  href={getWpAdminUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-medium text-green-800 underline hover:text-green-900"
                >
                  Till Wordpress admin
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
          
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="accent-primary"
            />
            Håll mig inloggad
          </label>
          
          <div className="space-y-2">
            <Label htmlFor="username">Användarnamn</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Lösenord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            {isDevelopment && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDevLogin} 
                disabled={loading}
                className="sm:mr-auto"
              >
                {loading ? <LoadingDots text="Dev Login" /> : '🔑 Dev Login'}
              </Button>
            )}
            
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingDots text="Loggar in" /> : 'Logga in'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
