/**
 * Utility module for Earned Value Management (EVM) calculations.
 */

/**
 * Calculate Earned Value Management (EVM) metrics.
 * @param {Object} data - Input data including BAC, % planned, % completed, actual cost, and schedule info.
 * @returns {Object} Calculated EVM metrics.
 */
export function calculateEVMMetrics(data) {
  const {
     BAC, // Budget at Completion
    percentPlanned, // % Progress Planned (0-1)
    percentCompleted, // % Progress Completed (0-1)
    actualCost, // Actual Cost (ACWP)
    plannedDuration, // Planned duration in days
    elapsedDuration, // Elapsed duration in days
    previousMetrics // Optional: Previous metrics for trend analysis
  } = data;

  // Basic EVM calculations
  const PV = percentPlanned * BAC;
  const EV = percentCompleted * BAC;
  const AC = actualCost;

  // Variances
  const CV = EV - AC;
  const SV = EV - PV;

  // Performance Indices
  const CPI = AC === 0 ? 0 : EV / AC;
  const SPI = PV === 0 ? 0 : EV / PV;

  // New: To Complete Performance Index (TCPI)
  // TCPI = (BAC - EV) / (BAC - AC)
  const TCPI = (BAC - AC === 0) ? 0 : (BAC - EV) / (BAC - AC);

  // Estimates
  const ETC = CPI === 0 ? 0 : (BAC - EV) / CPI;
  const EAC = AC + ETC;

  // New: Variance at Completion (VAC)
  // VAC = BAC - EAC
  const VAC = BAC - EAC;

  // Schedule estimates
  const remainingDuration = plannedDuration - elapsedDuration;
  const ETS = SPI === 0 ? 0 : remainingDuration / SPI;
  const EAS = elapsedDuration + ETS;

  // New: Performance Efficiency Factor (PEF)
  // Combines cost and schedule performance
  const PEF = (CPI * SPI) / 2;

  // New: Trend Analysis
  const trends = previousMetrics ? {
    cpiTrend: CPI - previousMetrics.costPerformanceIndex,
    spiTrend: SPI - previousMetrics.schedulePerformanceIndex,
    evTrend: EV - previousMetrics.earnedValue,
    completionTrend: percentCompleted - previousMetrics.percentCompleted
  } : null;

  // New: Critical Path Performance Index (CPPI)
  // Assuming critical path activities have higher weight
  const CPPI = SPI * (percentCompleted > 0.5 ? 1.2 : 1);

  return {
    plannedValue: PV,
    earnedValue: EV,
    actualCost: AC,
    costVariance: CV,
    scheduleVariance: SV,
    costPerformanceIndex: CPI,
    schedulePerformanceIndex: SPI,
    toCompletePerformanceIndex: TCPI,
    estimateToComplete: ETC,
    estimateAtCompletion: EAC,
    varianceAtCompletion: VAC,
    estimateTemporarySchedule: ETS,
    estimateAllSchedule: EAS,
    performanceEfficiencyFactor: PEF,
    criticalPathPerformanceIndex: CPPI,
    percentPlanned: percentPlanned * 100,
    percentCompleted: percentCompleted * 100,
    trends,
    projectHealth: calculateProjectHealth(CPI, SPI, percentCompleted)
  };
}

/**
 * Calculate overall project health status based on key metrics
 * @param {number} CPI - Cost Performance Index
 * @param {number} SPI - Schedule Performance Index
 * @param {number} percentCompleted - Completion percentage (0-1)
 * @returns {string} Project health status
 */
function calculateProjectHealth(CPI, SPI, percentCompleted) {
  const weights = {
    cpi: 0.4,
    spi: 0.4,
    progress: 0.2
  };

  const cpiScore = CPI >= 1 ? 1 : CPI;
  const spiScore = SPI >= 1 ? 1 : SPI;
  const progressScore = percentCompleted;

  const healthScore = 
    (cpiScore * weights.cpi) + 
    (spiScore * weights.spi) + 
    (progressScore * weights.progress);

  if (healthScore >= 0.8) return 'HEALTHY';
  if (healthScore >= 0.6) return 'ATTENTION';
  if (healthScore >= 0.4) return 'AT_RISK';
  return 'CRITICAL';
}
