import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit, LucideGraduationCap, Zap } from 'lucide-react';
import { memo } from 'react';

export const Route = createFileRoute('/')({
    component: LandingPage,
});

// Hero Section Component
const HeroSection = memo(() => {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-block bg-gradient-to-r from-primary/20 to-secondary/30 p-4 rounded-full mb-6">
        <LucideGraduationCap className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Unlock Your Potential with OpenEdu
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
        Learn Web3, AI, and Decentralized Science through interactive courses, quizzes, and community engagement. Own your learning journey.
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/learn">
          <Button size="lg">Start Learning <ArrowRight className="ml-2 h-5 w-5" /></Button>
        </Link>
        <Link to="/chat">
          <Button size="lg" variant="outline">Ask AI Assistant</Button>
        </Link>
      </div>
    </div>
  );
});

// Feature Highlight Component
const FeatureHighlight = memo(({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-secondary/50 rounded-lg">
      <div className="bg-primary/10 p-3 rounded-full mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
});

function LandingPage() {
    return (
        <div className="space-y-12 md:space-y-20 pb-16">
            <HeroSection />
            
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-10">Why OpenEdu?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureHighlight 
                  icon={BrainCircuit}
                  title="Interactive Learning"
                  description="Engage with hands-on courses and quizzes designed for effective knowledge retention."
                />
                <FeatureHighlight 
                  icon={Zap}
                  title="AI-Powered Assistance"
                  description="Get instant help and guidance from our intelligent AI assistant integrated within the platform."
                />
                <FeatureHighlight 
                  icon={LucideGraduationCap}
                  title="Community & Ownership"
                  description="Connect with fellow learners, earn rewards, and truly own your educational progress on-chain."
                />
              </div>
            </div>
            
            {/* Add more sections like Course Previews, Testimonials, Call to Action etc. */}
            
        </div>
    );
}
