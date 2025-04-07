import { cn } from '@/lib/utils';
import { Link, useLocation } from '@tanstack/react-router';
import { Home, MessageSquare, Settings } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MessageSquare, label: "Chat", path: "/chat" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-muted border-t border-border flex items-center justify-around px-2 z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <item.icon 
              className={cn(
                "w-6 h-6 mb-1", 
                isActive ? "text-primary" : "text-muted-foreground"
              )} 
            />
            <span 
              className={cn(
                "text-xs", 
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavigation;