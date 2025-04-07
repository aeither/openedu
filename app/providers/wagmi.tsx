import {
    darkTheme,
    getDefaultConfig,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi';
import {
    rootstockTestnet, flowTestnet, celoAlfajores
} from 'wagmi/chains';

const config = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
    chains: [rootstockTestnet, flowTestnet, celoAlfajores],
    ssr: true, // Enable server-side rendering if required
});

const queryClient = new QueryClient();

export const WagmiRainbowKitProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()} initialChain={flowTestnet}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};
