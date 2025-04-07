import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from '@tanstack/react-router';
import { toast } from 'sonner';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showBackButton = false,
  showNotifications = true
}) => {
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';
  
  const handleConnectWallet = () => {
    toast("Web3 wallet connection initiated");
  };
  
  return (
    <div className="flex justify-between items-center p-4">
      <div className="flex items-center gap-3">
        {showBackButton && !isHomePage && (
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </Button>
          </Link>
        )}
        
        <div>
          {title && <h1 className="text-xl font-bold text-foreground">{title}</h1>}
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {showNotifications && (
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="text-foreground" />
          </Button>
        )}
        
        <Button 
          onClick={handleConnectWallet} 
          variant="outline" 
          className="rounded-full border-primary text-primary hover:bg-primary/10"
        >
          Connect Wallet
        </Button>
      </div>
    </div>
  );
};

export default Header;