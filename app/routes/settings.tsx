import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ChevronRight, MessageSquare, User, HelpCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppLayout title="Settings" showBackButton={true}>
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 p-6 space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>

          {/* Get Full Access Button */}
          <div className="w-full">
            <Button 
              className="w-full py-6 bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 rounded-full text-lg"
              variant="default"
              onClick={() => console.log('Get full access clicked')}
            >
              Get Full Access
            </Button>
          </div>

          {/* Community Section */}
          <div>
            <h2 className="text-lg text-muted-foreground mb-3">Community</h2>
            <div className="bg-card rounded-lg overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-4 text-left border-b border-border hover:bg-muted transition"
                onClick={() => console.log('Invite a friend clicked')}
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>Invite a friend</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <button 
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition"
                onClick={() => window.open('https://t.me/dailywiser', '_blank')}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <span>Join our Telegram</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div>
            <h2 className="text-lg text-muted-foreground mb-3">Support</h2>
            <div className="bg-card rounded-lg overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-4 text-left border-b border-border hover:bg-muted transition"
                onClick={() => console.log('Need help clicked')}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <span>Need help?</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <button 
                className="w-full flex items-center justify-between p-4 text-left border-b border-border hover:bg-muted transition"
                onClick={() => console.log('Terms of Service clicked')}
              >
                <span>Terms of Service</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <button 
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition"
                onClick={() => console.log('Privacy Policy clicked')}
              >
                <span>Privacy Policy</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
