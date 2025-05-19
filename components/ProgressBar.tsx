"use client"

import React from 'react';
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
  allowBackNavigation?: boolean;
}

export function ProgressBar({ steps, currentStep, onStepClick, allowBackNavigation = true }: ProgressBarProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute h-1 bg-gray-200 top-1/2 left-0 right-0 -translate-y-1/2 z-0"></div>
        <div 
          className="absolute h-1 bg-[#1A3721] top-1/2 left-0 -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {/* Steps */}
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isClickable = allowBackNavigation && onStepClick && index < currentIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                  isActive 
                    ? "bg-[#1A3721] text-white" 
                    : "bg-gray-200 text-gray-500",
                  isCurrent && "ring-2 ring-[#CCFF00] ring-offset-2",
                  isClickable && "cursor-pointer hover:ring-2 hover:ring-[#CCFF00] hover:ring-offset-1"
                )}
              >
                {index + 1}
              </button>
              <span className={cn(
                "mt-2 text-xs whitespace-nowrap",
                isActive ? "text-[#1A3721] font-medium" : "text-gray-500"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
