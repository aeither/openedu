import { ConnectButton } from '@rainbow-me/rainbowkit';
import { createFileRoute } from '@tanstack/react-router';
import { MintNFT } from '../components/MintNFT';

export const Route = createFileRoute('/playground')({
  component: Home,
});

function Home() {
  return (
    <div className="p-2">
      <div className="mb-4">
        <ConnectButton />
      </div>
      <h3 className="text-xl font-bold mb-4">Cronological NFT Playground</h3>
      <MintNFT />
    </div>
  );
}
