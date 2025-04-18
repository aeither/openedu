import { ConnectButton } from '@rainbow-me/rainbowkit';
import { createFileRoute } from '@tanstack/react-router';
import { MintNFT } from '../components/MintNFT';
import { useTRPC } from '@/trpc/react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';

export const Route = createFileRoute('/playground')({
  component: Home,
});

function Home() {
  const trpc = useTRPC();
  const { address, isConnected } = useAccount();
  const helloMutation = useMutation(
    trpc.triggerDev.triggerHelloWorld.mutationOptions({
      onSuccess: (data) => console.log('helloWorldTask triggered', data),
      onError: (err) => console.error('Error triggering helloWorldTask:', err),
    })
  );

  const handleTrigger = () => {
    if (!address) return;
    helloMutation.mutate({
      chatId: address,
      action: 'hello_world',
      data: { message: 'Hello from playground' },
    });
  };

  return (
    <div className="p-2">
      <div className="mb-4">
        <ConnectButton />
      </div>
      <h3 className="text-xl font-bold mb-4">Cronological NFT Playground</h3>
      <MintNFT />
      <Button
        onClick={handleTrigger}
        disabled={!isConnected || helloMutation.isPending}
      >
        {helloMutation.isPending
          ? 'Triggering...'
          : !isConnected
          ? 'Connect Wallet to Trigger'
          : 'Trigger Hello World Task'}
      </Button>
      {helloMutation.isError && (
        <p className="text-destructive text-sm">
          {helloMutation.error instanceof Error
            ? helloMutation.error.message
            : 'Failed to trigger task'}
        </p>
      )}
    </div>
  );
}
