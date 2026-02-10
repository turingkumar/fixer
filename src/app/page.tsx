'use client';

import React, { useState, useMemo } from 'react';
import TankVisual from '@/components/TankVisual';
import OptionCard from '@/components/OptionCard';
import {
  Ingredient,
  BatchSpec,
  CurrentBatch,
  TankConstraints,
  Economics,
  FixOption,
  calculateAllOptions
} from '@/lib/calculations';

// Default ingredients for eggnog production
const defaultIngredients: Ingredient[] = [
  { id: 'heavy_cream', name: 'Heavy Cream (40% fat)', fatPercent: 40, flavorLevel: 10, costPerLb: 2.50, type: 'liquid', available: true },
  { id: 'light_cream', name: 'Light Cream (20% fat)', fatPercent: 20, flavorLevel: 8, costPerLb: 1.80, type: 'liquid', available: true },
  { id: 'whole_milk', name: 'Whole Milk (3.5% fat)', fatPercent: 3.5, flavorLevel: 5, costPerLb: 0.45, type: 'liquid', available: true },
  { id: 'skim_milk', name: 'Skim Milk (0.1% fat)', fatPercent: 0.1, flavorLevel: 3, costPerLb: 0.35, type: 'liquid', available: true },
  { id: 'cream_powder', name: 'Cream Powder (72% fat)', fatPercent: 72, flavorLevel: 15, costPerLb: 8.00, type: 'dry', available: true },
  { id: 'nfdm', name: 'Nonfat Dry Milk (0.5% fat)', fatPercent: 0.5, flavorLevel: 20, costPerLb: 1.50, type: 'dry', available: true },
  { id: 'whole_milk_powder', name: 'Whole Milk Powder (26% fat)', fatPercent: 26, flavorLevel: 25, costPerLb: 3.20, type: 'dry', available: true },
  { id: 'butter', name: 'Butter (80% fat)', fatPercent: 80, flavorLevel: 5, costPerLb: 4.50, type: 'dry', available: false },
];

export default function Home() {
  // Batch Spec State
  const [targetFatPercent, setTargetFatPercent] = useState(8.0);
  const [targetFlavorLevel, setTargetFlavorLevel] = useState(50);
  const [toleranceFat, setToleranceFat] = useState(0.5);
  const [toleranceFlavor, setToleranceFlavor] = useState(5);
  
  // Current Batch State
  const [batchSizeLbs, setBatchSizeLbs] = useState(1000);
  const [actualFatPercent, setActualFatPercent] = useState(6.2);
  const [actualFlavorLevel, setActualFlavorLevel] = useState(42);
  const [batchCostToDate, setBatchCostToDate] = useState(850);
  
  // Tank Constraints
  const [tankMinCapacity, setTankMinCapacity] = useState(200);
  const [tankMaxCapacity, setTankMaxCapacity] = useState(1500);
  
  // Economics
  const [finishedValuePerLb, setFinishedValuePerLb] = useState(2.25);
  const [sellableDemandLbs, setSellableDemandLbs] = useState(1200);
  const [disposalCostPerLb, setDisposalCostPerLb] = useState(0.15);
  const [laborCostPerHour, setLaborCostPerHour] = useState(45);
  const [estimatedFixTimeHours, setEstimatedFixTimeHours] = useState(0.5);
  
  // Ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>(defaultIngredients);
  
  // Results
  const [results, setResults] = useState<FixOption[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  
  // Toggle ingredient availability
  const toggleIngredient = (id: string) => {
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, available: !ing.available } : ing
    ));
  };
  
  // Check if current batch is in spec
  const isCurrentlyInSpec = useMemo(() => {
    const fatOk = Math.abs(actualFatPercent - targetFatPercent) <= toleranceFat;
    const flavorOk = Math.abs(actualFlavorLevel - targetFlavorLevel) <= toleranceFlavor;
    return fatOk && flavorOk;
  }, [actualFatPercent, targetFatPercent, toleranceFat, actualFlavorLevel, targetFlavorLevel, toleranceFlavor]);
  
  // Run calculation
  const runCalculation = () => {
    const spec: BatchSpec = {
      targetFatPercent,
      targetFlavorLevel,
      toleranceFat,
      toleranceFlavor
    };
    
    const batch: CurrentBatch = {
      sizeLbs: batchSizeLbs,
      actualFatPercent,
      actualFlavorLevel,
      costToDate: batchCostToDate
    };
    
    const tank: TankConstraints = {
      minCapacityLbs: tankMinCapacity,
      maxCapacityLbs: tankMaxCapacity
    };
    
    const economics: Economics = {
      finishedValuePerLb,
      sellableDemandLbs,
      disposalCostPerLb,
      laborCostPerHour,
      estimatedFixTimeHours
    };
    
    const options = calculateAllOptions(batch, spec, tank, economics, ingredients);
    setResults(options);
    setHasCalculated(true);
  };

  return (
    <main className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-6 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🥛</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Batch Adjuster</h1>
              <p className="text-slate-400 text-sm">Milk Fat Correction Calculator for Eggnog</p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Two column layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* R&D Spec */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                R&D Specification (Target)
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Target Milk Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetFatPercent}
                    onChange={(e) => setTargetFatPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Tolerance ±</label>
                  <input
                    type="number"
                    step="0.1"
                    value={toleranceFat}
                    onChange={(e) => setToleranceFat(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Target Flavor Level (0-100)</label>
                  <input
                    type="number"
                    step="1"
                    value={targetFlavorLevel}
                    onChange={(e) => setTargetFlavorLevel(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Flavor Tolerance ±</label>
                  <input
                    type="number"
                    step="1"
                    value={toleranceFlavor}
                    onChange={(e) => setToleranceFlavor(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </section>
            
            {/* Current Batch Sample */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                Current Batch (Sample Results)
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Batch Size (lbs)</label>
                  <input
                    type="number"
                    step="1"
                    value={batchSizeLbs}
                    onChange={(e) => setBatchSizeLbs(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Batch Cost to Date ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={batchCostToDate}
                    onChange={(e) => setBatchCostToDate(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Actual Milk Fat %
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                      Math.abs(actualFatPercent - targetFatPercent) <= toleranceFat 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {Math.abs(actualFatPercent - targetFatPercent) <= toleranceFat ? 'IN SPEC' : 'OUT OF SPEC'}
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={actualFatPercent}
                    onChange={(e) => setActualFatPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Actual Flavor Level
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                      Math.abs(actualFlavorLevel - targetFlavorLevel) <= toleranceFlavor 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {Math.abs(actualFlavorLevel - targetFlavorLevel) <= toleranceFlavor ? 'IN SPEC' : 'OUT OF SPEC'}
                    </span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={actualFlavorLevel}
                    onChange={(e) => setActualFlavorLevel(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </section>
            
            {/* Tank Constraints */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                Tank Constraints
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Min Capacity (lbs)</label>
                  <input
                    type="number"
                    step="1"
                    value={tankMinCapacity}
                    onChange={(e) => setTankMinCapacity(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Max Capacity (lbs)</label>
                  <input
                    type="number"
                    step="1"
                    value={tankMaxCapacity}
                    onChange={(e) => setTankMaxCapacity(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>
            </section>
            
            {/* Economics */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                Economics
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Finished Value ($/lb)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={finishedValuePerLb}
                    onChange={(e) => setFinishedValuePerLb(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Sellable Demand (lbs)</label>
                  <input
                    type="number"
                    step="1"
                    value={sellableDemandLbs}
                    onChange={(e) => setSellableDemandLbs(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Disposal Cost ($/lb)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={disposalCostPerLb}
                    onChange={(e) => setDisposalCostPerLb(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Labor Cost ($/hr)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={laborCostPerHour}
                    onChange={(e) => setLaborCostPerHour(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Est. Fix Time (hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={estimatedFixTimeHours}
                    onChange={(e) => setEstimatedFixTimeHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </section>
            
            {/* Available Ingredients */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                Available Adjustment Ingredients
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {ingredients.map((ing) => (
                  <div 
                    key={ing.id}
                    onClick={() => toggleIngredient(ing.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      ing.available 
                        ? 'bg-purple-50 border-purple-400 shadow-sm' 
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        ing.available ? 'bg-purple-500 border-purple-500' : 'border-slate-300'
                      }`}>
                        {ing.available && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800 text-sm">{ing.name}</div>
                        <div className="text-xs text-slate-500">
                          {ing.type === 'liquid' ? '💧' : '📦'} ${ing.costPerLb.toFixed(2)}/lb
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          {/* Right column: Tank visualization & Calculate button */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">Current Tank Status</h2>
              
              <div className="flex justify-center mb-6">
                <TankVisual
                  currentLbs={batchSizeLbs}
                  maxCapacityLbs={tankMaxCapacity}
                  minCapacityLbs={tankMinCapacity}
                  fatPercent={actualFatPercent}
                  targetFatPercent={targetFatPercent}
                  inSpec={isCurrentlyInSpec}
                  label="Batch Tank"
                />
              </div>
              
              {/* Status summary */}
              <div className={`p-4 rounded-xl mb-6 ${
                isCurrentlyInSpec 
                  ? 'bg-emerald-50 border border-emerald-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isCurrentlyInSpec ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isCurrentlyInSpec ? '✓ IN SPEC' : '✗ OUT OF SPEC'}
                  </div>
                  {!isCurrentlyInSpec && (
                    <div className="mt-2 text-sm text-slate-600">
                      Fat: {actualFatPercent}% (target: {targetFatPercent}% ±{toleranceFat}%)
                      <br />
                      Flavor: {actualFlavorLevel} (target: {targetFlavorLevel} ±{toleranceFlavor})
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={runCalculation}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg"
              >
                Calculate Fix Options
              </button>
              
              <p className="text-xs text-center text-slate-400 mt-3">
                Runs Pearson Square + Mass Balance + Cost Optimization
              </p>
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        {hasCalculated && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Fix Options
              <span className="ml-3 text-sm font-normal text-slate-500">
                {results.filter(r => r.recommendation !== 'not_recommended').length} viable options found
              </span>
            </h2>
            
            {results.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <div className="text-lg font-semibold text-amber-800">No viable fix options found</div>
                <div className="text-amber-600 mt-2">
                  Check your available ingredients and tank constraints. The batch may not be fixable with current resources.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((option, index) => (
                  <OptionCard 
                    key={option.id} 
                    option={option} 
                    isExpanded={index === 0}
                  />
                ))}
              </div>
            )}
          </section>
        )}
        
        {/* Old vs New Process Comparison */}
        <section className="mt-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
          <h2 className="text-xl font-bold mb-6">Why This Is Better Than Manual Pearson Square + Mass Balance</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-red-400 mb-3">❌ Old Process (2 Steps)</h3>
              <ol className="space-y-2 text-slate-300">
                <li>1. Manually calculate Pearson Square for ONE ingredient</li>
                <li>2. Manually verify with mass balance</li>
                <li>3. Repeat for each ingredient option</li>
                <li>4. Manually compare costs</li>
                <li>5. Hope you didn't miss a better option</li>
                <li>6. No automatic consideration of tank limits or sellable demand</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-400 mb-3">✓ New Process (1 Click)</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• Evaluates ALL ingredients simultaneously</li>
                <li>• Considers bottle-off + adjust combinations</li>
                <li>• Automatically respects tank min/max</li>
                <li>• Calculates true net outcome including disposal</li>
                <li>• Flags when fixing creates unsellable surplus</li>
                <li>• Shows full Pearson Square + mass balance math for verification</li>
                <li>• Ranks options by economics, not just feasibility</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
