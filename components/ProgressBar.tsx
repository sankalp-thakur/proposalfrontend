"use client"

import React from 'react';
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function ProgressBar({ steps, currentStep, onStepClick }: ProgressBarProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step circle */}
            <div
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full 
                ${index < currentStep 
                  ? 'bg-green-600 text-white' 
                  : index === currentStep 
                    ? 'bg-[#1A3721] text-white' 
                    : 'bg-gray-200 text-gray-600'
                } 
                ${onStepClick ? 'cursor-pointer' : ''}`}
              onClick={() => onStepClick && onStepClick(index)}
            >
              <span>{index + 1}</span>
              
              {/* Step label */}
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-medium">
                {step}
              </span>
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div 
                className={`h-1 flex-1 ${
                  index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
