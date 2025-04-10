import React, { memo, useRef, forwardRef } from 'react';
import { AnimatedBeam } from '../../components/magicui/animated-beam'; // Ensure this path is correct relative to THIS file
import { cn } from '@/lib/utils';

// Import Assets - Adjust path relative to this component file
import OpenEduLogo from '../assets/openedu.png';
import EduChainLogo from '../assets/educhain.png';
import Ed3Logo from '../assets/ed3.png';
import DailyWiserLogo from '../assets/dailywiser.png';
import GraspLogo from '../assets/grasp.png';
import SailfishLogo from '../assets/sailfish.png';

// Logo Circle Component
const LogoCircle = forwardRef<
  HTMLDivElement,
  { className?: string; imgSrc: string; alt: string }
>(({ className, imgSrc, alt }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-16 items-center justify-center rounded-full border-2 border-border/20 bg-background/90 p-2 shadow-md",
        className,
      )}
    >
      <img src={imgSrc} alt={alt} className="h-full w-full object-contain rounded-full" />
    </div>
  );
});
LogoCircle.displayName = "LogoCircle";

// Ecosystem Animated Beam Section Component
export const EcosystemBeamSection = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const eduChainRef = useRef<HTMLDivElement>(null);
  const ed3Ref = useRef<HTMLDivElement>(null);
  const dailyWiserRef = useRef<HTMLDivElement>(null);
  const openEduRef = useRef<HTMLDivElement>(null);
  const graspRef = useRef<HTMLDivElement>(null);
  const sailfishRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-16">
      <h2 className="relative z-10 text-3xl font-bold text-center mb-16">Connected Ecosystem</h2>
      <div
        className="relative flex w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-10 md:shadow-xl min-h-[450px]"
        ref={containerRef}
      >
        <div className="flex size-full flex-col items-stretch justify-between gap-10">
          {/* Top Row */}
          <div className="flex flex-row items-center justify-between">
            <LogoCircle ref={eduChainRef} imgSrc={EduChainLogo} alt="EDU Chain" className="ml-4" />
            <LogoCircle ref={ed3Ref} imgSrc={Ed3Logo} alt="ED3" className="mr-4" />
          </div>
          {/* Middle Row (Center) */}
          <div className="flex flex-row items-center justify-center">
            <LogoCircle ref={openEduRef} imgSrc={OpenEduLogo} alt="OpenEdu" className="!size-20" />
          </div>
          {/* Bottom Row */}
          <div className="flex flex-row items-center justify-between">
            <LogoCircle ref={dailyWiserRef} imgSrc={DailyWiserLogo} alt="Daily Wiser" className="ml-4" />
            <LogoCircle ref={graspRef} imgSrc={GraspLogo} alt="Grasp" />
            <LogoCircle ref={sailfishRef} imgSrc={SailfishLogo} alt="Sailfish" className="mr-4" />
          </div>
        </div>

        {/* Beams connecting TO OpenEdu */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={eduChainRef}
          toRef={openEduRef}
          curvature={-75}
          endYOffset={-10}
          duration={5}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={ed3Ref}
          toRef={openEduRef}
          curvature={75}
          endYOffset={-10}
          duration={5}
          reverse
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={dailyWiserRef}
          toRef={openEduRef}
          curvature={75}
          endYOffset={10}
          duration={4}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={graspRef}
          toRef={openEduRef}
          duration={3}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={sailfishRef}
          toRef={openEduRef}
          curvature={-75}
          endYOffset={10}
          duration={6}
          reverse
        />
      </div>
    </div>
  );
});

EcosystemBeamSection.displayName = "EcosystemBeamSection";
