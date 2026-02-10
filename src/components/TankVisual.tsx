'use client';

import React from 'react';

interface TankVisualProps {
  currentLbs: number;
  maxCapacityLbs: number;
  minCapacityLbs: number;
  fatPercent: number;
  targetFatPercent: number;
  inSpec: boolean;
  label?: string;
}

export default function TankVisual({
  currentLbs,
  maxCapacityLbs,
  minCapacityLbs,
  fatPercent,
  targetFatPercent,
  inSpec,
  label = 'Tank'
}: TankVisualProps) {
  const fillPercent = Math.min(100, (currentLbs / maxCapacityLbs) * 100);
  const minLine = (minCapacityLbs / maxCapacityLbs) * 100;
  
  const statusColor = inSpec 
    ? 'from-emerald-400 to-emerald-600' 
    : Math.abs(fatPercent - targetFatPercent) < 1 
      ? 'from-amber-400 to-amber-600'
      : 'from-red-400 to-red-600';
  
  const statusBorder = inSpec 
    ? 'border-emerald-500' 
    : Math.abs(fatPercent - targetFatPercent) < 1 
      ? 'border-amber-500'
      : 'border-red-500';

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-medium text-slate-500 mb-2">{label}</span>
      
      {/* Tank container */}
      <div className={`relative w-24 h-40 bg-slate-100 rounded-b-3xl rounded-t-lg border-4 ${statusBorder} overflow-hidden shadow-inner`}>
        {/* Min capacity line */}
        <div 
          className="absolute w-full border-t-2 border-dashed border-slate-400 z-10"
          style={{ bottom: `${minLine}%` }}
        >
          <span className="absolute -right-1 -top-3 text-[10px] text-slate-400">MIN</span>
        </div>
        
        {/* Fill level */}
        <div 
          className={`absolute bottom-0 w-full bg-gradient-to-t ${statusColor} transition-all duration-700 ease-out`}
          style={{ height: `${fillPercent}%` }}
        >
          {/* Cream layer simulation */}
          <div className="absolute top-0 w-full h-3 bg-gradient-to-b from-yellow-100/60 to-transparent" />
          
          {/* Ripple effect */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/20 rounded-full animate-pulse" />
        </div>
        
        {/* Tank markings */}
        <div className="absolute right-1 top-2 bottom-2 w-1 flex flex-col justify-between">
          {[100, 75, 50, 25].map((mark) => (
            <div key={mark} className="flex items-center">
              <div className="w-2 h-px bg-slate-300" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Readings */}
      <div className="mt-3 text-center">
        <div className="font-mono text-lg font-semibold text-slate-800">
          {currentLbs.toLocaleString()} lbs
        </div>
        <div className={`font-mono text-sm ${inSpec ? 'text-emerald-600' : 'text-red-600'}`}>
          {fatPercent.toFixed(2)}% fat
        </div>
        <div className="text-xs text-slate-400">
          target: {targetFatPercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
