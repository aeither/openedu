import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ProtocolBadge from '@/components/common/ProtocolBadge';
import { useNavigate } from '@tanstack/react-router';
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { tokenAbi } from '@/abi/tokenABI';
import { moneymarketAbi } from '@/abi/moneymarketABI';
import { useContractAddresses } from '@/constants';

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
}

const merchantProducts: Record<string, {
    name: string;
    logo: string;
    cashback: string;
    protocol: string;
    products: Product[]
}> = {
    "starbucks": {
        name: "Starbucks",
        logo: "",
        cashback: "3.5%",
        protocol: "Curve",
        products: [
            { id: 1, name: "Caramel Macchiato", price: 4.95, description: "Espresso with vanilla-flavored syrup and caramel", image: "" },
            { id: 2, name: "Pumpkin Spice Latte", price: 5.25, description: "Seasonal favorite with pumpkin and spice flavors", image: "" },
            { id: 3, name: "Cold Brew", price: 3.75, description: "Slow-steeped, super-smooth cold coffee", image: "" },
            { id: 4, name: "Iced Matcha Latte", price: 4.45, description: "Green tea blended with milk over ice", image: "" },
            { id: 5, name: "Chocolate Croissant", price: 3.50, description: "Buttery croissant filled with chocolate", image: "" }
        ]
    },
    "amazon": {
        name: "Amazon",
        logo: "",
        cashback: "2.5%",
        protocol: "Aave",
        products: [
            { id: 1, name: "Echo Dot", price: 49.50, description: "Smart speaker with Alexa", image: "" },
            { id: 2, name: "Kindle Paperwhite", price: 139.95, description: "Waterproof e-reader", image: "" },
            { id: 3, name: "Fire TV Stick", price: 39.49, description: "Stream your favorite content", image: "" },
            { id: 4, name: "AmazonBasics Batteries", price: 12.75, description: "Pack of 48 AA batteries", image: "" },
            { id: 5, name: "Ring Video Doorbell", price: 99.29, description: "Smart home security", image: "" }
        ]
    },
    "uber": {
        name: "Uber",
        logo: "",
        cashback: "3%",
        protocol: "Compound",
        products: [
            { id: 1, name: "UberX Ride", price: 15.99, description: "Economy ride for up to 4 people", image: "" },
            { id: 2, name: "Uber Comfort", price: 22.50, description: "Extra legroom and newer cars", image: "" },
            { id: 3, name: "Uber Black", price: 45.00, description: "Premium ride with professional drivers", image: "" },
            { id: 4, name: "Uber Eats Delivery", price: 3.99, description: "Food delivery service fee", image: "" },
            { id: 5, name: "Uber One Membership", price: 9.99, description: "Monthly subscription for discounts", image: "" }
        ]
    },
    "airbnb": {
        name: "Airbnb",
        logo: "",
        cashback: "5%",
        protocol: "Lido",
        products: [
            { id: 1, name: "City Apartment", price: 120.00, description: "Urban one-bedroom apartment", image: "" },
            { id: 2, name: "Beach House", price: 250.00, description: "Oceanfront property", image: "" },
            { id: 3, name: "Mountain Cabin", price: 180.00, description: "Cozy retreat in the mountains", image: "" },
            { id: 4, name: "Luxury Villa", price: 450.00, description: "Exclusive property with amenities", image: "" },
            { id: 5, name: "Treehouse Experience", price: 150.00, description: "Unique stay among the trees", image: "" }
        ]
    }
};

export const Route = createFileRoute('/merchant/$id')({
    component: MerchantDetail,
})

function MerchantDetail() {
    const { id } = Route.useParams();
    const [cart, setCart] = useState<Product[]>([]);
    const [checkoutStatus, setCheckoutStatus] = useState<{
        step: 'idle' | 'approving' | 'transferring' | 'depositing' | 'completed';
        txHash?: `0x${string}`;
    }>({ step: 'idle' });
    const navigate = useNavigate();

    const { address } = useAccount();
    const chainId = useChainId();
    const { TOKEN_CONTRACT_ADDRESS, MONEYMARKET_CONTRACT_ADDRESS } = useContractAddresses();

    const { data: allowanceData, refetch: checkAllowance } = useReadContract({
        address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
        abi: tokenAbi,
        functionName: 'allowance',
        args: [
            address ? address as `0x${string}` : undefined as any,
            MONEYMARKET_CONTRACT_ADDRESS as `0x${string}`
        ],
        query: {
            enabled: false,
        }
    });

    const { writeContract: approveTokens, data: approvalTxHash } = useWriteContract();
    const { writeContract: transferTokens, data: transferTxHash } = useWriteContract();
    const { writeContract: depositToMoneyMarket, data: depositTxHash } = useWriteContract();

    // Transaction receipt hooks for tracking on-chain confirmations
    const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = 
        useWaitForTransactionReceipt({ 
            hash: checkoutStatus.step === 'approving' ? approvalTxHash : undefined,
        });

    const { isLoading: isTransferConfirming, isSuccess: isTransferConfirmed } = 
        useWaitForTransactionReceipt({ 
            hash: checkoutStatus.step === 'transferring' ? transferTxHash : undefined,
        });

    const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } = 
        useWaitForTransactionReceipt({ 
            hash: checkoutStatus.step === 'depositing' ? depositTxHash : undefined,
        });

    // Effect to handle state transitions based on transaction confirmations
    React.useEffect(() => {
        const processNextStep = async () => {
            if (checkoutStatus.step === 'approving' && isApprovalConfirmed) {
                toast.success("Approval confirmed on blockchain!");
                await checkAllowance();
                setCheckoutStatus({ step: 'transferring' });
                
                try {
                    transferTokens({
                        address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
                        abi: tokenAbi,
                        functionName: 'transfer',
                        args: ['0xF80A5B8cFF2160B17F63053B4FC7326E08D597D9', cartTotal],
                    });
                } catch (error) {
                    toast.error("Failed to send payment transaction");
                    setCheckoutStatus({ step: 'idle' });
                }
            } 
            else if (checkoutStatus.step === 'transferring' && isTransferConfirmed) {
                toast.success("Payment confirmed on blockchain!");
                setCheckoutStatus({ step: 'depositing' });
                
                try {
                    depositToMoneyMarket({
                        address: MONEYMARKET_CONTRACT_ADDRESS as `0x${string}`,
                        abi: moneymarketAbi,
                        functionName: 'deposit',
                        args: [roundupAmount],
                    });
                } catch (error) {
                    toast.error("Failed to send deposit transaction");
                    setCheckoutStatus({ step: 'completed' });
                    showCompletionMessage();
                }
            }
            else if (checkoutStatus.step === 'depositing' && isDepositConfirmed) {
                toast.success("Roundup investment confirmed on blockchain!");
                setCheckoutStatus({ step: 'completed' });
                showCompletionMessage();
            }
        };

        processNextStep();
    }, [
        checkoutStatus.step, 
        isApprovalConfirmed, 
        isTransferConfirmed, 
        isDepositConfirmed
    ]);

    // Variables to store cart calculations for use in effects
    const [cartTotal, setCartTotal] = useState<bigint>(0n);
    const [roundupAmount, setRoundupAmount] = useState<bigint>(0n);
    const [merchantData, setMerchantData] = useState<typeof merchantProducts[keyof typeof merchantProducts] | null>(null);

    // Show the completion message and redirect
    const showCompletionMessage = () => {
        if (!merchantData) return;
        
        const total = Number(formatUnits(cartTotal, 18));
        const roundUp = Number(formatUnits(roundupAmount, 18));
        
        toast(
            <div className="flex flex-col gap-2">
                <div className="font-medium">Purchase Complete!</div>
                <div className="text-sm text-muted-foreground">Total: ${total.toFixed(2)}</div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-primary">+${roundUp.toFixed(2)} invested in</span>
                    <ProtocolBadge name={merchantData.protocol} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                    Tokens spent: {total.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                    Round-up deposited: {roundUp.toFixed(2)}
                </div>
            </div>
        );

        setCart([]);

        setTimeout(() => {
            navigate({
                to: '/earn',
            });
        }, 2000);
    };

    const merchant = id && merchantProducts[id.toLowerCase()];

    if (!merchant) {
        return (
            <AppLayout title="Merchant Not Found" showBackButton={true}>
                <div className="p-4 flex flex-col items-center justify-center h-[70vh]">
                    <p className="text-muted-foreground">The merchant you're looking for doesn't exist.</p>
                    <Link to="/earn">
                        <Button className="mt-4">
                            Back to Earn
                        </Button>
                    </Link>
                </div>
            </AppLayout>
        );
    }

    const addToCart = (product: Product) => {
        setCart([...cart, product]);
        toast.success(`Added ${product.name} to cart`);
    };

    const checkout = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        const total = cart.reduce((sum, product) => sum + product.price, 0);
        const roundUp = Math.ceil(total) - total;

        if (!address) {
            toast.error("Please connect your wallet to checkout");
            return;
        }

        try {
            // Store values for use in effects
            const totalTokens = parseUnits(total.toString(), 18);
            const roundUpTokens = parseUnits(roundUp.toString(), 18);
            setCartTotal(totalTokens);
            setRoundupAmount(roundUpTokens);
            setMerchantData(merchant);
            
            console.log("🚀 ~ checkout ~ roundUpTokens:", roundUpTokens);

            // Step 1: Check allowance first - properly wait for the result
            toast.info("Checking token allowance...");
            const { data: freshAllowanceData } = await checkAllowance();
            
            // Safely handle allowanceData which might be undefined
            const allowance = typeof freshAllowanceData === 'bigint' ? freshAllowanceData : 0n;
            console.log("🚀 ~ checkout ~ allowance:", allowance);

            // Step 2: Get approval if needed before proceeding
            if (allowance < roundUpTokens) {
                toast.info("Approving tokens for deposit...");
                setCheckoutStatus({ step: 'approving' });
                
                try {
                    approveTokens({
                        address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
                        abi: tokenAbi,
                        functionName: 'approve',
                        args: [MONEYMARKET_CONTRACT_ADDRESS as `0x${string}`, parseUnits('9999999', 18)],
                    });
                } catch (error) {
                    toast.error("Failed to send approval transaction");
                    setCheckoutStatus({ step: 'idle' });
                    return;
                }
            } else {
                toast.success("You already have enough allowance for this transaction");
                toast.info("Processing payment...");
                setCheckoutStatus({ step: 'transferring' });
                
                try {
                    transferTokens({
                        address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
                        abi: tokenAbi,
                        functionName: 'transfer',
                        args: ['0xF80A5B8cFF2160B17F63053B4FC7326E08D597D9', totalTokens],
                    });
                } catch (error) {
                    toast.error("Failed to send payment transaction");
                    setCheckoutStatus({ step: 'idle' });
                }
            }
        } catch (error) {
            console.error("Transaction failed:", error);
            toast.error("Transaction failed. Please try again.");
            setCheckoutStatus({ step: 'idle' });
        }
    };

    // Status badges for the checkout button
    const getCheckoutButtonText = () => {
        switch (checkoutStatus.step) {
            case 'approving':
                return isApprovalConfirming ? "Approving..." : "Waiting for approval...";
            case 'transferring':
                return isTransferConfirming ? "Processing payment..." : "Waiting for payment...";
            case 'depositing':
                return isDepositConfirming ? "Investing roundup..." : "Waiting for investment...";
            case 'completed':
                return "Completed";
            default:
                return "Checkout";
        }
    };

    return (
        <AppLayout
            title={merchant.name}
            subtitle={`${merchant.cashback} Cashback`}
            showBackButton={true}
            showNotifications={false}
        >
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-4xl">
                            {merchant.logo}
                        </div>
                        <div>
                            <Badge variant="outline" className="bg-secondary/50">
                                {merchant.cashback} Cashback
                            </Badge>
                            <div className="text-sm text-muted-foreground mt-1">
                                Invested with <ProtocolBadge name={merchant.protocol} className="ml-1" />
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={checkout}
                        variant="outline"
                        className="relative rounded-full border-primary"
                        disabled={cart.length === 0 || checkoutStatus.step !== 'idle'}
                    >
                        <ShoppingCart className="mr-2 h-4 w-4 text-primary" />
                        <span>{getCheckoutButtonText()}</span>
                        {cart.length > 0 && checkoutStatus.step === 'idle' && (
                            <span className="absolute -top-2 -right-2 bg-primary text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                                {cart.length}
                            </span>
                        )}
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {merchant.products.map((product) => (
                        <div key={product.id} className="acorn-card flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-secondary/70 flex items-center justify-center text-2xl">
                                    {product.image}
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.description}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <p className="font-medium text-foreground">${product.price.toFixed(2)}</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => addToCart(product)}
                                    disabled={checkoutStatus.step !== 'idle'}
                                >
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
};
