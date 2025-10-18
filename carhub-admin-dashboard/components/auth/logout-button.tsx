// components/auth/logout-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { logout } from '@/lib/api/auth';
import { toast } from 'sonner';

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await logout();
      toast.success('Logged out successfully');
      // Redirect will happen automatically due to token clearance
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="w-full justify-start"
    >
      <LogOut className="h-4 w-4 mr-2" />
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </Button>
  );
}