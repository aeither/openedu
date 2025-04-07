import { createFileRoute, useNavigate } from '@tanstack/react-router';
import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Play } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/course/$id')({
    component: RouteComponent,
})

interface Course {
    id: number;
    title: string;
    description: string;
    content: string;
    image: string;
    duration: string;
    level: string;
    format: string;
}

const courses: Record<string, Course> = {
    "defi-basics": {
        id: 1,
        title: "DeFi Basics",
        description: "Learn the fundamentals of decentralized finance",
        content: "Decentralized Finance (DeFi) represents a shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on blockchain. With DeFi, you can do most of the things that banks support — earn interest, borrow, lend, buy insurance, trade derivatives, trade assets, and more — but it's faster and doesn't require paperwork or a third party. This course covers the fundamental concepts of DeFi including its benefits, risks, and major protocols.",
        image: "📊",
        duration: "15 mins",
        level: "Beginner",
        format: "Article"
    },
    "yield-farming": {
        id: 2,
        title: "Yield Farming",
        description: "Maximize your returns with yield farming strategies",
        content: "Yield farming, also referred to as liquidity mining, is a way to generate rewards with cryptocurrency holdings. In simple terms, it means locking up cryptocurrencies and getting rewards. Yield farming is currently the biggest growth driver of the still-nascent DeFi industry. This course will walk you through different yield farming strategies, risk management, and the top protocols to consider for maximizing your returns.",
        image: "🌱",
        duration: "20 mins",
        level: "Intermediate",
        format: "Video"
    },
    "liquidity-pools": {
        id: 3,
        title: "Liquidity Pools",
        description: "Understanding how liquidity pools work",
        content: "Liquidity pools are one of the foundational technologies behind the current DeFi ecosystem. They are essentially pools of tokens locked in a smart contract. They are used to facilitate trading by providing liquidity and are extensively used by automated market makers (AMMs). Liquidity pools are the backbone of many decentralized exchanges. This course will help you understand how liquidity pools work, their advantages, risks, and how to participate as a liquidity provider.",
        image: "💧",
        duration: "12 mins",
        level: "Beginner",
        format: "Article"
    },
    "smart-contracts": {
        id: 4,
        title: "Smart Contracts",
        description: "The backbone of DeFi explained",
        content: "Smart contracts are self-executing contracts with the terms directly written into code. They run on blockchains and automatically execute when predetermined conditions are met, without the need for intermediaries. Smart contracts are the backbone of decentralized applications (dApps) and DeFi protocols. This course will introduce you to the concept of smart contracts, their capabilities, limitations, and security considerations. You'll also learn about the most popular smart contract platforms and languages.",
        image: "📝",
        duration: "25 mins",
        level: "Advanced",
        format: "Video"
    }
};

function RouteComponent() {
    const { id } = Route.useParams();
    const navigate = useNavigate();

    const course = id && courses[id];

    if (!course) {
        return (
            <AppLayout title="Course Not Found" showBackButton={true}>
                <div className="p-4 flex flex-col items-center justify-center h-[70vh]">
                    <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
                    <Button onClick={() => navigate({ to: '/learn' })} className="mt-4">
                        Back to Learn
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const handleStartCourse = () => {
        toast.success(`Started learning: ${course.title}`);
    };

    return (
        <AppLayout
            title={course.title}
            showBackButton={true}
            showNotifications={false}
        >
            <div className="p-4 space-y-6">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/50 rounded-xl flex items-center justify-center mb-6">
                    <span className="text-6xl">{course.image}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-1 text-sm bg-secondary/50 px-2 py-1 rounded-md">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{course.duration}</span>
                    </div>

                    <Badge variant="outline" className="bg-secondary/50">
                        {course.level}
                    </Badge>

                    <Badge variant="outline" className="bg-secondary/50 flex items-center gap-1">
                        {course.format === "Video" ? (
                            <Play className="w-3 h-3" />
                        ) : (
                            <BookOpen className="w-3 h-3" />
                        )}
                        {course.format}
                    </Badge>
                </div>

                <div className="space-y-4">
                    <p className="text-lg text-foreground">{course.description}</p>

                    <div className="bg-secondary/30 rounded-lg p-4 text-foreground/90">
                        <p className="leading-relaxed">{course.content}</p>
                    </div>

                    <div className="flex justify-between mt-8">
                        <Button
                            variant="outline"
                            onClick={() => navigate({ to: '/learn' })}
                            className="border-primary/50 text-primary hover:bg-primary/10"
                        >
                            Back to Courses
                        </Button>

                        <Button onClick={handleStartCourse}>
                            Start Learning
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
