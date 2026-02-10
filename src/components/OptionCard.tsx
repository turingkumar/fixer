'use client';

import React, { useState } from 'react';
import { FixOption, formatCurrency, formatPercent } from '@/lib/calculations';

interface OptionCardProps {
  option: FixOption;
  isExpanded?: boolean;
}

export default function OptionCard({ option, isExpanded: initialExpanded = false }: OptionCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  
  const bgColor = {
    'best': 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400',
    'viable': 'bg-gradient-to-br from-sky-50 to-blue-50 border-sky-400',
    'marginal': 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-400',
    'not_recommended': 'bg-gradient-to-br from-slate-50 to-gray-100 border-slate-300'
  }[option.recommendation];
  
  const badgeColor = {
    'best': 'bg-emerald-500 text-white',
    'viable': 'bg-sky-500 text-white',
    'marginal': 'bg-amber-500 text-white',
    'not_recommended': 'bg-slate-400 text-white'
  }[option.recommendation];
  
  const badgeText = {
    'best': '★ BEST OPTION',
    'viable': 'VIABLE',
    'marginal': 'MARGINAL',
    'not_recommended': 'NOT RECOMMENDED'
  }[option.recommendation];

  return (
    <div className={`rounded-xl border-2 ${bgColor} overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${badgeColor}`}>
                {badgeText}
              </span>
              <span className="text-xs text-slate-500">Rank #{option.rank}</span>
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">
              {option.description}
            </h3>
          </div>
          
          <div className="text-right">
            <div className={`font-mono text-xl font-bold ${option.netOutcome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(option.netOutcome)}
            </div>
            <div className="text-xs text-slate-500">net outcome</div>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="mt-3 grid grid-cols-4 gap-3 text-center">
          <div className="bg-white/60 rounded-lg p-2">
            <div className="text-xs text-slate-500">Resulting Batch</div>
            <div className="font-mono font-semibold text-slate-800">
              {option.resultingBatchLbs.toLocaleString()} lbs
            </div>
          </div>
          <div className="bg-white/60 rounded-lg p-2">
            <div className="text-xs text-slate-500">Fat %</div>
            <div className={`font-mono font-semibold ${option.inSpec ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatPercent(option.resultingFatPercent)}
            </div>
          </div>
          <div className="bg-white/60 rounded-lg p-2">
            <div className="text-xs text-slate-500">Fix Cost</div>
            <div className="font-mono font-semibold text-slate-800">
              {formatCurrency(option.totalFixCost)}
            </div>
          </div>
          <div className="bg-white/60 rounded-lg p-2">
            <div className="text-xs text-slate-500">vs Scrap</div>
            <div className={`font-mono font-semibold ${option.vsScrapDelta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {option.vsScrapDelta >= 0 ? '+' : ''}{formatCurrency(option.vsScrapDelta)}
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-center">
          <span className="text-xs text-slate-400">
            {isExpanded ? '▲ Click to collapse' : '▼ Click to see math & details'}
          </span>
        </div>
      </div>
      
      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-white/40 p-4 space-y-4">
          {/* Actions */}
          <div>
            <h4 className="font-semibold text-sm text-slate-600 mb-2">ACTIONS</h4>
            <div className="space-y-2">
              {option.actions.map((action, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    action.action === 'add' ? 'bg-emerald-500' : action.action === 'remove' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}>
                    {action.action === 'add' ? '+' : action.action === 'remove' ? '−' : '→'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">
                      {action.action === 'add' && `Add ${action.amountLbs.toFixed(1)} lbs of ${action.ingredientName}`}
                      {action.action === 'remove' && `Remove ${action.amountLbs.toFixed(1)} lbs from tank`}
                      {action.action === 'transfer' && `Transfer ${action.amountLbs.toFixed(1)} lbs`}
                    </div>
                    {action.cost > 0 && (
                      <div className="text-sm text-slate-500">Cost: {formatCurrency(action.cost)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pearson Square breakdown */}
          {option.pearsonSquareCalc && (
            <div>
              <h4 className="font-semibold text-sm text-slate-600 mb-2">PEARSON SQUARE CALCULATION</h4>
              <div className="bg-white rounded-lg p-4 font-mono text-sm">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-slate-500 text-xs">Batch</div>
                    <div className="text-lg font-bold">{option.pearsonSquareCalc.batchPercent.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Target</div>
                    <div className="text-lg font-bold text-emerald-600">{option.pearsonSquareCalc.targetPercent.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Ingredient</div>
                    <div className="text-lg font-bold">{option.pearsonSquareCalc.ingredientPercent.toFixed(2)}%</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Parts ratio:</div>
                  <div>
                    Batch : Ingredient = {option.pearsonSquareCalc.partsBatch.toFixed(2)} : {option.pearsonSquareCalc.partsIngredient.toFixed(2)}
                  </div>
                  <div className="mt-2 text-emerald-600 font-semibold">
                    → Need {option.pearsonSquareCalc.ingredientNeededLbs.toFixed(1)} lbs of ingredient
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mass balance verification */}
          {option.massBalanceCalc && (
            <div>
              <h4 className="font-semibold text-sm text-slate-600 mb-2">MASS BALANCE VERIFICATION</h4>
              <div className="bg-white rounded-lg p-4 font-mono text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Initial batch:</span>
                    <span>{option.massBalanceCalc.initialMassLbs.toFixed(1)} lbs @ {(option.massBalanceCalc.initialComponentMassLbs / option.massBalanceCalc.initialMassLbs * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat content:</span>
                    <span>{option.massBalanceCalc.initialComponentMassLbs.toFixed(2)} lbs fat</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>+ Added:</span>
                    <span>{option.massBalanceCalc.addedMassLbs.toFixed(1)} lbs ({option.massBalanceCalc.addedComponentMassLbs.toFixed(2)} lbs fat)</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                    <span>= Final:</span>
                    <span>{option.massBalanceCalc.finalMassLbs.toFixed(1)} lbs @ {option.massBalanceCalc.finalPercent.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Economics breakdown */}
          <div>
            <h4 className="font-semibold text-sm text-slate-600 mb-2">ECONOMICS BREAKDOWN</h4>
            <div className="bg-white rounded-lg p-4 font-mono text-sm space-y-2">
              <div className="flex justify-between">
                <span>Ingredient cost:</span>
                <span>{formatCurrency(option.ingredientCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Labor cost:</span>
                <span>{formatCurrency(option.laborCost)}</span>
              </div>
              {option.surplusDisposalCost > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Surplus disposal:</span>
                  <span>{formatCurrency(option.surplusDisposalCost)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold">
                <span>Total fix cost:</span>
                <span>{formatCurrency(option.totalFixCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sellable volume:</span>
                <span>{option.sellableVolumeLbs.toLocaleString()} lbs</span>
              </div>
              {option.surplusLbs > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Unsellable surplus:</span>
                  <span>{option.surplusLbs.toLocaleString()} lbs</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Batch value after fix:</span>
                <span>{formatCurrency(option.batchValueAfterFix)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-lg">
                <span>NET OUTCOME:</span>
                <span className={option.netOutcome >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {formatCurrency(option.netOutcome)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
