import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowRight, Database, Link as LinkIcon, Library, Wrench, Network } from 'lucide-react'; 
import { memo } from 'react'; 
import { DotLottieReact } from '@lottiefiles/dotlottie-react'; 

export const Route = createFileRoute('/')({
    component: LandingPage,
});

// Hero Section Component
const HeroSection = memo(() => {
  return (
    <div className="relative z-10 text-center py-16 px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Unified Education<br/>on the Blockchain
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
        OpenEdu is your gateway to the EDU Chain ecosystem, connecting you to educational tools and resources powered by blockchain technology.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/notes" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto">Create Notes <ArrowRight className="ml-2 h-5 w-5" /></Button>
        </Link>
        <Link to="/chat" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">Engage with Apps</Button>
        </Link>
      </div>
    </div>
  );
});

// Feature Highlight Component
const FeatureHighlight = memo(({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => {
  return (
    <div className="relative z-10 flex flex-col items-center text-center p-6 bg-background/80 backdrop-blur-sm rounded-lg border border-border/20 shadow-lg">
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
        <div className="relative overflow-hidden min-h-screen flex flex-col">
            <div className="absolute inset-0 z-0 opacity-30 dark:opacity-10 pointer-events-none">
              <DotLottieReact
                src="https://lottie.host/e84d07ef-92e1-43a4-a5e2-6f29ef758b87/80jrujqMW0.lottie"
                loop
                autoplay
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            
            <div className="space-y-12 md:space-y-20 pb-16 pt-16 flex-grow"> 
              <HeroSection />
              
              <div className="max-w-5xl mx-auto px-4">
                <h2 className="relative z-10 text-3xl font-bold text-center mb-10">Why OpenEdu?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FeatureHighlight 
                    icon={Network} 
                    title="Ecosystem Integration"
                    description="A centralized platform connecting users to various applications in the EDU Chain ecosystem."
                  />
                  <FeatureHighlight 
                    icon={Wrench} 
                    title="Educational Tools"
                    description="AI-driven tools like notes, flashcards, and quiz generators for personalized learning."
                  />
                  <FeatureHighlight 
                    icon={Library} 
                    title="Knowledge Repository"
                    description="Access the EDU Chain's comprehensive educational resources."
                  />
                </div>
              </div>

            </div>
        </div>
    );
}
