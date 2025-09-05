
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LifeBuoy, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type TourStep = {
  elementId: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
};

type InteractiveTourProps = {
  pageKey: string;
  steps: TourStep[];
};

export default function InteractiveTour({ pageKey, steps }: InteractiveTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const storageKey = `interactive-tour-completed-${pageKey}`;

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem(storageKey);
    if (!hasCompletedTour) {
      setIsOpen(true);
    }
  }, [storageKey]);

  const activeStep = steps[currentStep];
  const targetElement = activeStep ? document.getElementById(activeStep.elementId) : null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleFinish = () => {
    setIsOpen(false);
    localStorage.setItem(storageKey, 'true');
    setCurrentStep(0);
  };
  
  const startTour = () => {
      setCurrentStep(0);
      setIsOpen(true);
  }

  const HighlightOverlay = () => {
    if (!isOpen || !targetElement) return null;

    const rect = targetElement.getBoundingClientRect();
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${rect.left - 4}px`,
      top: `${rect.top - 4}px`,
      width: `${rect.width + 8}px`,
      height: `${rect.height + 8}px`,
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
      borderRadius: '6px',
      zIndex: 1000,
      pointerEvents: 'none',
      transition: 'all 0.3s ease-in-out',
    };

    return <div style={style} />;
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg z-50"
        onClick={startTour}
      >
        <LifeBuoy className="h-8 w-8" />
        <span className="sr-only">Допомога</span>
      </Button>
      
      <HighlightOverlay />

      {targetElement && (
         <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div 
              style={{ 
                position: 'fixed', 
                left: targetElement.getBoundingClientRect().left,
                top: targetElement.getBoundingClientRect().top,
                width: targetElement.getBoundingClientRect().width,
                height: targetElement.getBoundingClientRect().height,
                zIndex: 1001,
                pointerEvents: 'none'
               }}
            />
          </PopoverTrigger>
          <PopoverContent 
            side={activeStep.placement || 'bottom'} 
            align="start"
            className="z-[1001] w-80"
             onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{activeStep.title}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleFinish}>
                    <X className="h-4 w-4"/>
                </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {activeStep.content}
            </p>
            <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{currentStep + 1} / {steps.length}</span>
                <div className="flex gap-2">
                     <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handlePrev} 
                        disabled={currentStep === 0}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1"/> Назад
                    </Button>
                     <Button size="sm" onClick={handleNext}>
                        {currentStep === steps.length - 1 ? "Завершити" : "Далі"}
                        <ChevronRight className="h-4 w-4 ml-1"/>
                    </Button>
                </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
