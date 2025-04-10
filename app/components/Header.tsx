import { useTRPC } from '@/trpc/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

export function Header() {
  const { address, isConnected } = useAccount();
  const trpc = useTRPC();
  const [feedback, setFeedback] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Existing user creation mutation
  const createUserMutation = useMutation(
    trpc.user.createUser.mutationOptions({
      onError: (error: any) => {
        if (error.data?.code !== 'CONFLICT') {
          console.error('Failed to create user:', error);
        }
      }
    })
  );

  // Feedback mutation - Updated to use notification router with simpler response
  const feedbackMutation = useMutation(
    trpc.notification.notifyFeedback.mutationOptions({ 
      onSuccess: (_data: { success: boolean }) => { // Type updated to match router response
        setIsDialogOpen(false);
        setFeedback('');
        // Simpler success message
        toast.success(`Thank you for your feedback!`); 
      },
      onError: (error: any) => { // Explicitly type error
        console.error("Feedback submission failed:", error);
        // Show error toast
        toast.error(`Failed to send feedback: ${error.message}`); 
      }
    })
  );

  useEffect(() => {
    if (isConnected && address) {
      // Pass the correct input object
      createUserMutation.mutate({ userAddress: address }); 
    }
  }, [isConnected, address]);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (address && feedback) {
      feedbackMutation.mutate({
        feedback,
        option: 'general', // Ensure this matches backend expectations
        userAddress: address
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-sm z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex-shrink-0 flex items-center gap-4">
            {/* <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            >
              <PenSquare className="w-5 h-5" />
            </button> */}
            <Link to="/" className="text-xl font-bold">
              OpenEdu
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Feedback
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <p className='text-sm text-muted-foreground'>Share your thoughts or report issues!</p>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Your feedback..."
                    required
                    minLength={10} // Add minLength for quality feedback
                  />
                  <Button
                    type="submit"
                    // Disable button while submitting
                    disabled={feedbackMutation.isPending || !feedback.trim()}
                  >
                    {feedbackMutation.isPending ? "Sending..." : "Send Feedback"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog> */}

            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
