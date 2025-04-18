// src/components/auth/LoginModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import LoadingDots from '@/components/ui/LoadingDots';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { login, devLogin } = useAuth();

  // Check if in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await login(username, password);
      if (result.success) {
        // Show success message
        setSuccess(true);
        // Reset form
        setUsername('');
        setPassword('');
        // Close after a short delay
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(result.error || 'Inloggningen misslyckades. Kontrollera dina uppgifter.');
      }
    } catch (error) {
      // Log error and show detailed message if available
      console.error('Login error:', error);
      setError(`Ett fel uppstod vid inloggning: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await devLogin();
      if (result.success) {
        // Show success message
        setSuccess(true);
        // Close after a short delay
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(result.error || 'Dev-inloggning misslyckades. Kontrollera .env.local filen.');
      }
    } catch (error) {
      // Log error details for debugging
      console.error('Dev login error:', error);
      setError(`Ett fel uppstod vid dev-inloggning: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            </div>
          )}
          
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
