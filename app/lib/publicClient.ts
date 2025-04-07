import { createPublicClient, http } from "viem";
import { celo, cronos, flowMainnet, flowTestnet, rootstock, sepolia, zircuit } from "viem/chains";

export function getPublicClient(chainId: number) {
    // Map containing only Cronos and Sepolia
    const chains = {
        25: cronos,
        11155111: sepolia,
        48900: zircuit,
        42_220: celo,
        747: flowMainnet,
        30: rootstock,
        545: flowTestnet
    }

    // Get the chain from the map or default to Sepolia
    const chain = chains[chainId as keyof typeof chains] || sepolia

    // Create and return the public client
    const publicClient = createPublicClient({
        chain,
        transport: http(),
        batch: {
            multicall: true,
        },
    })

    return publicClient
}
