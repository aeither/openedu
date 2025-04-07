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
    eduChain
} from 'wagmi/chains';

const config = getDefaultConfig({
    appName: 'OpenEdu',
    projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
    chains: [eduChain],
    ssr: true, // Enable server-side rendering if required
});

const queryClient = new QueryClient();

export const WagmiRainbowKitProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()} initialChain={eduChain}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};
