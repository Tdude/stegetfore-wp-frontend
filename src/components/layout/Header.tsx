import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User } from 'lucide-react';

/**
 * Main application header
 * Contains logo, navigation, and authentication controls
 */
const Header: React.FC = () => {
  const { isAuthenticated, userInfo, logout } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <div className="text-xl font-bold text-primary">Steget Före</div>
            </Link>
            {/* Add your existing navigation here */}
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/start">
              <Button className="bg-primary text-white px-4 py-2 rounded">
                Börja nu
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center">
                <div className="mr-3 text-sm">
                  <span className="font-medium">{userInfo?.display_name || 'Användare'}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout}
                  className="flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logga ut
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center"
              >
                <LogIn className="h-4 w-4 mr-1" />
                Logga in
              </Button>
            )}
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </header>
  );
};

export default Header;
