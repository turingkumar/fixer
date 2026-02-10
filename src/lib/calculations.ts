// Batch Adjustment Calculation Engine
// Combines Pearson Square with mass balance and cost optimization

export interface Ingredient {
  id: string;
  name: string;
  fatPercent: number;
  flavorLevel: number; // 0-100 scale
  costPerLb: number;
  type: 'liquid' | 'dry';
  available: boolean;
}

export interface BatchSpec {
  targetFatPercent: number;
  targetFlavorLevel: number;
  toleranceFat: number; // e.g., 0.5 means ±0.5%
  toleranceFlavor: number;
}

export interface CurrentBatch {
  sizeLbs: number;
  actualFatPercent: number;
  actualFlavorLevel: number;
  costToDate: number;
}

export interface TankConstraints {
  minCapacityLbs: number;
  maxCapacityLbs: number;
}

export interface Economics {
  finishedValuePerLb: number;
  sellableDemandLbs: number;
  disposalCostPerLb: number;
  laborCostPerHour: number;
  estimatedFixTimeHours: number;
}

export interface FixOption {
  id: string;
  type: 'add_single' | 'add_blend' | 'bottle_off_adjust' | 'split_tank' | 'scrap';
  description: string;
  actions: FixAction[];
  resultingBatchLbs: number;
  resultingFatPercent: number;
  resultingFlavorLevel: number;
  inSpec: boolean;
  
  // Economics
  ingredientCost: number;
  laborCost: number;
  disposalCost: number;
  totalFixCost: number;
  
  sellableVolumeLbs: number;
  surplusLbs: number;
  surplusDisposalCost: number;
  
  batchValueAfterFix: number;
  totalCostIncludingOriginal: number;
  netOutcome: number; // positive = profit, negative = loss
  
  // Comparison
  vsScrapDelta: number; // how much better/worse than scrapping
  
  // Math breakdown for transparency
  pearsonSquareCalc?: PearsonSquareResult;
  massBalanceCalc?: MassBalanceResult;
  
  rank: number;
  recommendation: 'best' | 'viable' | 'marginal' | 'not_recommended';
}

export interface FixAction {
  action: 'add' | 'remove' | 'transfer';
  ingredientId?: string;
  ingredientName?: string;
  amountLbs: number;
  cost: number;
}

export interface PearsonSquareResult {
  batchPercent: number;
  targetPercent: number;
  ingredientPercent: number;
  partsBatch: number;
  partsIngredient: number;
  ingredientNeededLbs: number;
}

export interface MassBalanceResult {
  initialMassLbs: number;
  initialComponentMassLbs: number;
  addedMassLbs: number;
  addedComponentMassLbs: number;
  finalMassLbs: number;
  finalComponentMassLbs: number;
  finalPercent: number;
}

// Pearson Square calculation for single ingredient adjustment
export function pearsonSquare(
  batchSizeLbs: number,
  batchPercent: number,
  targetPercent: number,
  ingredientPercent: number
): PearsonSquareResult | null {
  // Pearson Square only works if ingredient can move us toward target
  // If batch is below target, ingredient must be above target (or vice versa)
  
  const batchIsLow = batchPercent < targetPercent;
  const ingredientCanHelp = batchIsLow 
    ? ingredientPercent > targetPercent 
    : ingredientPercent < targetPercent;
  
  if (!ingredientCanHelp && ingredientPercent !== targetPercent) {
    return null; // This ingredient can't help
  }
  
  // Pearson Square parts calculation
  const partsBatch = Math.abs(ingredientPercent - targetPercent);
  const partsIngredient = Math.abs(batchPercent - targetPercent);
  
  if (partsBatch === 0) {
    return null; // Would need infinite ingredient
  }
  
  // Calculate ingredient needed
  const ratio = partsIngredient / partsBatch;
  const ingredientNeededLbs = batchSizeLbs * ratio;
  
  return {
    batchPercent,
    targetPercent,
    ingredientPercent,
    partsBatch,
    partsIngredient,
    ingredientNeededLbs
  };
}

// Mass balance verification
export function massBalance(
  batchSizeLbs: number,
  batchPercent: number,
  addedLbs: number,
  addedPercent: number
): MassBalanceResult {
  const initialComponentMass = batchSizeLbs * (batchPercent / 100);
  const addedComponentMass = addedLbs * (addedPercent / 100);
  
  const finalMass = batchSizeLbs + addedLbs;
  const finalComponentMass = initialComponentMass + addedComponentMass;
  const finalPercent = (finalComponentMass / finalMass) * 100;
  
  return {
    initialMassLbs: batchSizeLbs,
    initialComponentMassLbs: initialComponentMass,
    addedMassLbs: addedLbs,
    addedComponentMassLbs: addedComponentMass,
    finalMassLbs: finalMass,
    finalComponentMassLbs: finalComponentMass,
    finalPercent
  };
}

// Check if result is within spec
function isInSpec(
  actualFat: number,
  actualFlavor: number,
  spec: BatchSpec
): boolean {
  const fatInSpec = Math.abs(actualFat - spec.targetFatPercent) <= spec.toleranceFat;
  const flavorInSpec = Math.abs(actualFlavor - spec.targetFlavorLevel) <= spec.toleranceFlavor;
  return fatInSpec && flavorInSpec;
}

// Calculate scrap economics (baseline for comparison)
function calculateScrapOption(
  batch: CurrentBatch,
  economics: Economics
): FixOption {
  const disposalCost = batch.sizeLbs * economics.disposalCostPerLb;
  const totalLoss = batch.costToDate + disposalCost;
  
  return {
    id: 'scrap',
    type: 'scrap',
    description: 'Scrap the entire batch',
    actions: [{
      action: 'remove',
      amountLbs: batch.sizeLbs,
      cost: disposalCost
    }],
    resultingBatchLbs: 0,
    resultingFatPercent: 0,
    resultingFlavorLevel: 0,
    inSpec: false,
    
    ingredientCost: 0,
    laborCost: 0,
    disposalCost,
    totalFixCost: disposalCost,
    
    sellableVolumeLbs: 0,
    surplusLbs: 0,
    surplusDisposalCost: 0,
    
    batchValueAfterFix: 0,
    totalCostIncludingOriginal: totalLoss,
    netOutcome: -totalLoss,
    
    vsScrapDelta: 0,
    rank: 999,
    recommendation: 'not_recommended'
  };
}

// Generate single ingredient fix options
function generateSingleIngredientOptions(
  batch: CurrentBatch,
  spec: BatchSpec,
  tank: TankConstraints,
  economics: Economics,
  ingredients: Ingredient[],
  scrapNetOutcome: number
): FixOption[] {
  const options: FixOption[] = [];
  
  for (const ingredient of ingredients.filter(i => i.available)) {
    // Try to fix fat with this ingredient
    const fatPearson = pearsonSquare(
      batch.sizeLbs,
      batch.actualFatPercent,
      spec.targetFatPercent,
      ingredient.fatPercent
    );
    
    if (!fatPearson) continue;
    
    const amountNeeded = fatPearson.ingredientNeededLbs;
    const newBatchSize = batch.sizeLbs + amountNeeded;
    
    // Check tank constraints
    if (newBatchSize > tank.maxCapacityLbs) continue;
    if (newBatchSize < tank.minCapacityLbs) continue;
    
    // Calculate resulting specs
    const fatBalance = massBalance(
      batch.sizeLbs,
      batch.actualFatPercent,
      amountNeeded,
      ingredient.fatPercent
    );
    
    // Estimate flavor impact (weighted average)
    const resultingFlavor = (
      (batch.sizeLbs * batch.actualFlavorLevel) + 
      (amountNeeded * ingredient.flavorLevel)
    ) / newBatchSize;
    
    const inSpec = isInSpec(fatBalance.finalPercent, resultingFlavor, spec);
    
    // Economics
    const ingredientCost = amountNeeded * ingredient.costPerLb;
    const laborCost = economics.laborCostPerHour * economics.estimatedFixTimeHours;
    
    const sellableVolume = Math.min(newBatchSize, economics.sellableDemandLbs);
    const surplus = Math.max(0, newBatchSize - economics.sellableDemandLbs);
    const surplusDisposalCost = surplus * economics.disposalCostPerLb;
    
    const batchValue = sellableVolume * economics.finishedValuePerLb;
    const totalFixCost = ingredientCost + laborCost + surplusDisposalCost;
    const totalCost = batch.costToDate + totalFixCost;
    const netOutcome = batchValue - totalCost;
    
    const vsScrapDelta = netOutcome - scrapNetOutcome;
    
    options.push({
      id: `add_${ingredient.id}`,
      type: 'add_single',
      description: `Add ${amountNeeded.toFixed(1)} lbs of ${ingredient.name}`,
      actions: [{
        action: 'add',
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        amountLbs: amountNeeded,
        cost: ingredientCost
      }],
      resultingBatchLbs: newBatchSize,
      resultingFatPercent: fatBalance.finalPercent,
      resultingFlavorLevel: resultingFlavor,
      inSpec,
      
      ingredientCost,
      laborCost,
      disposalCost: 0,
      totalFixCost,
      
      sellableVolumeLbs: sellableVolume,
      surplusLbs: surplus,
      surplusDisposalCost,
      
      batchValueAfterFix: batchValue,
      totalCostIncludingOriginal: totalCost,
      netOutcome,
      
      vsScrapDelta,
      pearsonSquareCalc: fatPearson,
      massBalanceCalc: fatBalance,
      
      rank: 0,
      recommendation: 'viable'
    });
  }
  
  return options;
}

// Generate bottle-off options (remove some, then fix remainder)
function generateBottleOffOptions(
  batch: CurrentBatch,
  spec: BatchSpec,
  tank: TankConstraints,
  economics: Economics,
  ingredients: Ingredient[],
  scrapNetOutcome: number
): FixOption[] {
  const options: FixOption[] = [];
  
  // Try removing 10%, 20%, 30%, 40%, 50% of batch
  const removalPercentages = [0.1, 0.2, 0.3, 0.4, 0.5];
  
  for (const removalPct of removalPercentages) {
    const removeAmount = batch.sizeLbs * removalPct;
    const remainingBatch = batch.sizeLbs - removeAmount;
    
    if (remainingBatch < tank.minCapacityLbs) continue;
    
    // The removed portion goes to storage/rework - not disposed
    // Assume it retains some value for later blending
    const removedPortionValue = removeAmount * (economics.finishedValuePerLb * 0.5); // 50% recovery value
    
    // Now try to fix the remaining batch
    for (const ingredient of ingredients.filter(i => i.available)) {
      const fatPearson = pearsonSquare(
        remainingBatch,
        batch.actualFatPercent, // same concentration in remaining
        spec.targetFatPercent,
        ingredient.fatPercent
      );
      
      if (!fatPearson) continue;
      
      const amountNeeded = fatPearson.ingredientNeededLbs;
      const newBatchSize = remainingBatch + amountNeeded;
      
      if (newBatchSize > tank.maxCapacityLbs) continue;
      if (newBatchSize < tank.minCapacityLbs) continue;
      
      const fatBalance = massBalance(
        remainingBatch,
        batch.actualFatPercent,
        amountNeeded,
        ingredient.fatPercent
      );
      
      const resultingFlavor = (
        (remainingBatch * batch.actualFlavorLevel) + 
        (amountNeeded * ingredient.flavorLevel)
      ) / newBatchSize;
      
      const inSpec = isInSpec(fatBalance.finalPercent, resultingFlavor, spec);
      
      // Economics
      const ingredientCost = amountNeeded * ingredient.costPerLb;
      const laborCost = economics.laborCostPerHour * (economics.estimatedFixTimeHours * 1.5); // extra time for bottling
      
      const sellableVolume = Math.min(newBatchSize, economics.sellableDemandLbs);
      const surplus = Math.max(0, newBatchSize - economics.sellableDemandLbs);
      const surplusDisposalCost = surplus * economics.disposalCostPerLb;
      
      const batchValue = sellableVolume * economics.finishedValuePerLb + removedPortionValue;
      const totalFixCost = ingredientCost + laborCost + surplusDisposalCost;
      
      // Adjust original cost proportionally
      const remainingBatchCost = batch.costToDate * (remainingBatch / batch.sizeLbs);
      const totalCost = remainingBatchCost + totalFixCost;
      const netOutcome = batchValue - totalCost;
      
      const vsScrapDelta = netOutcome - scrapNetOutcome;
      
      options.push({
        id: `bottle_off_${(removalPct * 100).toFixed(0)}_add_${ingredient.id}`,
        type: 'bottle_off_adjust',
        description: `Remove ${removeAmount.toFixed(0)} lbs (${(removalPct * 100).toFixed(0)}%) for later, then add ${amountNeeded.toFixed(1)} lbs of ${ingredient.name}`,
        actions: [
          {
            action: 'remove',
            amountLbs: removeAmount,
            cost: 0 // not disposal, stored for later
          },
          {
            action: 'add',
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            amountLbs: amountNeeded,
            cost: ingredientCost
          }
        ],
        resultingBatchLbs: newBatchSize,
        resultingFatPercent: fatBalance.finalPercent,
        resultingFlavorLevel: resultingFlavor,
        inSpec,
        
        ingredientCost,
        laborCost,
        disposalCost: 0,
        totalFixCost,
        
        sellableVolumeLbs: sellableVolume,
        surplusLbs: surplus,
        surplusDisposalCost,
        
        batchValueAfterFix: batchValue,
        totalCostIncludingOriginal: totalCost,
        netOutcome,
        
        vsScrapDelta,
        pearsonSquareCalc: fatPearson,
        massBalanceCalc: fatBalance,
        
        rank: 0,
        recommendation: 'viable'
      });
    }
  }
  
  return options;
}

// Main calculation function
export function calculateAllOptions(
  batch: CurrentBatch,
  spec: BatchSpec,
  tank: TankConstraints,
  economics: Economics,
  ingredients: Ingredient[]
): FixOption[] {
  // First, calculate scrap as baseline
  const scrapOption = calculateScrapOption(batch, economics);
  const scrapNetOutcome = scrapOption.netOutcome;
  
  // Generate all fix options
  const singleIngredientOptions = generateSingleIngredientOptions(
    batch, spec, tank, economics, ingredients, scrapNetOutcome
  );
  
  const bottleOffOptions = generateBottleOffOptions(
    batch, spec, tank, economics, ingredients, scrapNetOutcome
  );
  
  // Combine all options
  let allOptions = [
    ...singleIngredientOptions,
    ...bottleOffOptions,
    scrapOption
  ];
  
  // Filter to only in-spec options (except scrap)
  allOptions = allOptions.filter(opt => opt.inSpec || opt.type === 'scrap');
  
  // Sort by net outcome (best first)
  allOptions.sort((a, b) => b.netOutcome - a.netOutcome);
  
  // Assign ranks and recommendations
  allOptions.forEach((opt, index) => {
    opt.rank = index + 1;
    
    if (opt.type === 'scrap') {
      opt.recommendation = 'not_recommended';
    } else if (index === 0) {
      opt.recommendation = 'best';
    } else if (opt.vsScrapDelta > 0) {
      opt.recommendation = opt.vsScrapDelta > (scrapNetOutcome * -0.5) ? 'viable' : 'marginal';
    } else {
      opt.recommendation = 'not_recommended';
    }
  });
  
  return allOptions;
}

// Format currency
export function formatCurrency(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

// Format percentage
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}
