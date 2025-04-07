import { createFileRoute, Link } from '@tanstack/react-router';
import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Clock, Play } from 'lucide-react';

export const Route = createFileRoute('/learn')({
    component: Learn,
})

function Learn() {
    const featuredCourses = [
        {
            id: "defi-basics",
            title: "DeFi Basics",
            description: "Learn the fundamentals of decentralized finance",
            image: "📊",
            duration: "15 mins",
            level: "Beginner"
        },
        {
            id: "yield-farming",
            title: "Yield Farming",
            description: "Maximize your returns with yield farming strategies",
            image: "🌱",
            duration: "20 mins",
            level: "Intermediate"
        },
        {
            id: "liquidity-pools",
            title: "Liquidity Pools",
            description: "Understanding how liquidity pools work",
            image: "💧",
            duration: "12 mins",
            level: "Beginner"
        }
    ];

    const allCourses = [
        {
            id: "smart-contracts",
            title: "Smart Contracts",
            description: "The backbone of DeFi explained",
            image: "📝",
            duration: "25 mins",
            level: "Advanced",
            format: "Video"
        },
        {
            id: "crypto-wallets",
            title: "Crypto Wallets",
            description: "Secure your digital assets",
            image: "👛",
            duration: "10 mins",
            level: "Beginner",
            format: "Article"
        },
        {
            id: "dex-trading",
            title: "DEX Trading",
            description: "Trading on decentralized exchanges",
            image: "📈",
            duration: "18 mins",
            level: "Intermediate",
            format: "Video"
        },
        {
            id: "nft-basics",
            title: "NFT Basics",
            description: "Understanding non-fungible tokens",
            image: "🖼️",
            duration: "15 mins",
            level: "Beginner",
            format: "Article"
        },
        {
            id: "defi-risk",
            title: "DeFi Risk Management",
            description: "Learn to analyze and mitigate risks",
            image: "⚠️",
            duration: "22 mins",
            level: "Advanced",
            format: "Video"
        },
        {
            id: "stablecoins",
            title: "Stablecoins Explained",
            description: "The role of stablecoins in crypto",
            image: "💰",
            duration: "14 mins",
            level: "Beginner",
            format: "Article"
        }
    ];

    return (
        <AppLayout title="Learn" showBackButton={true}>
            <div className="p-4 space-y-6">
                <div className="acorn-card bg-gradient-to-br from-primary/30 to-secondary/50 border-0">
                    <h2 className="text-lg font-semibold text-foreground mb-2">Start your DeFi journey</h2>
                    <p className="text-sm text-muted-foreground mb-4">Learn how to make the most of your investments</p>
                    <div className="flex gap-2">
                        <Link to="/course/$id" params={{ id: 'defi-basics' }}>
                            <Button>Get Started</Button>
                        </Link>
                        <Link to="/">
                            <Button variant="outline" className="border-border">View Progress</Button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-foreground">Featured Courses</h2>
                        <Link to="/" className="text-primary text-sm flex items-center">
                            View all <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                    </div>

                    <div className="flex overflow-x-auto gap-4 py-2 no-scrollbar">
                        {featuredCourses.map((course) => (
                            <Link key={course.id} to="/course/$id" params={{ id: course.id }} className="acorn-card min-w-64 border border-border">
                                <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/40 rounded-lg flex items-center justify-center mb-3">
                                    <span className="text-5xl">{course.image}</span>
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                                <p className="text-xs text-muted-foreground mb-3">{course.description}</p>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>{course.duration}</span>
                                    </div>
                                    <Badge variant="outline" className="bg-secondary/50">
                                        {course.level}
                                    </Badge>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">All Courses</h2>

                    <div className="grid grid-cols-1 gap-3">
                        {allCourses.map((course) => (
                            <Link key={course.id} to="/course/$id" params={{ id: course.id }} className="acorn-card flex gap-3">
                                <div className="w-16 h-16 bg-secondary/70 rounded-lg flex items-center justify-center text-3xl shrink-0">
                                    {course.image}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-foreground">{course.title}</h3>
                                    <p className="text-xs text-muted-foreground mb-2">{course.description}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            <span>{course.duration}</span>
                                        </div>
                                        <Badge variant="outline" className="bg-secondary/50">
                                            {course.level}
                                        </Badge>
                                        <Badge variant="outline" className="flex items-center gap-1 bg-secondary/50">
                                            {course.format === "Video" ? (
                                                <Play className="w-3 h-3" />
                                            ) : (
                                                <BookOpen className="w-3 h-3" />
                                            )}
                                            {course.format}
                                        </Badge>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
