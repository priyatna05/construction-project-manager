import dayjs from './dayjsConfig';

/**
 * Utility functions for unit cost conversions
 * Based on real calendar calculations
 */

// Standard working hours per day
export const HOURS_PER_DAY = 8;

// Overtime multiplier
export const OVERTIME_MULTIPLIER = 1.5;

/**
 * Calculate working days in a month (excluding weekends)
 * @param {dayjs.Dayjs} date - Date to calculate for (defaults to current month)
 * @returns {number} Number of working days
 */
export function getWorkingDaysInMonth(date = dayjs()) {
  const start = date.startOf('month');
  const end = date.endOf('month');
  let workingDays = 0;

  let current = start;
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    // 0 = Sunday, 6 = Saturday
    if (current.day() !== 0 && current.day() !== 6) {
      workingDays++;
    }
    current = current.add(1, 'day');
  }

  return workingDays;
}

/**
 * Get current month's working days
 * @returns {number}
 */
export function getCurrentMonthWorkingDays() {
  return getWorkingDaysInMonth(new Date());
}

/**
 * Calculate monthly cost based on working days
 * @param {number} dailyRate - Daily rate
 * @param {Date} date - Date to calculate for
 * @returns {number} Monthly cost
 */
export function calculateMonthlyCostFromDaily(dailyRate, date = new Date()) {
  const workingDays = getWorkingDaysInMonth(date);
  return dailyRate * workingDays;
}

/**
 * Calculate daily cost from hourly rate
 * @param {number} hourlyRate - Hourly rate
 * @returns {number} Daily cost
 */
export function calculateDailyCostFromHourly(hourlyRate) {
  return hourlyRate * HOURS_PER_DAY;
}

/**
 * Calculate monthly cost from hourly rate
 * @param {number} hourlyRate - Hourly rate
 * @param {Date} date - Date to calculate for
 * @returns {number} Monthly cost
 */
export function calculateMonthlyCostFromHourly(hourlyRate, date = new Date()) {
  const dailyCost = calculateDailyCostFromHourly(hourlyRate);
  return calculateMonthlyCostFromDaily(dailyCost, date);
}

/**
 * Convert unit cost to per hour cost
 * @param {number} unitCost - Unit cost
 * @param {string} unit - Unit type ('Hour', 'Day', 'Month')
 * @param {dayjs.Dayjs} date - Date for monthly calculation (defaults to current)
 * @returns {number} Cost per hour
 */
export function convertToHourlyCost(unitCost, unit, date = dayjs()) {
  const uc = Number(unitCost) || 0;
  if (!unit) return uc;

  const normalizedUnit = unit.toLowerCase();
  switch (normalizedUnit) {
    case 'day':
      return uc / HOURS_PER_DAY;
    case 'month': {
      const workingDays = getWorkingDaysInMonth(date);
      return uc / (HOURS_PER_DAY * workingDays);
    }
    case 'hour':
    default:
      return uc;
  }
}

/**
 * Normalizes unit labels from user input or dropdown to standardized unit keys
 * used in conversion logic.
 *
 * Example:
 *  normalizeUnit('m²') => 'square_meter'
 *  normalizeUnit('Meter') => 'meter'
 *  normalizeUnit('Ha') => 'hectare'
 */
export function normalizeUnit(u) {
  if (!u) return '';

  const key = u.toString().trim().toLowerCase();

  const map = {
    // 📏 PANJANG
    mm: 'millimeter',
    millimeter: 'millimeter',
    cm: 'centimeter',
    centimeter: 'centimeter',
    m: 'meter',
    meter: 'meter',
    km: 'kilometer',
    kilometer: 'kilometer',

    // 📐 LUAS
    m2: 'square_meter',
    'm²': 'square_meter',
    sqm: 'square_meter',
    square_meter: 'square_meter',
    a: 'are',
    are: 'are',
    ha: 'hectare',
    hectare: 'hectare',

    // 🧱 VOLUME
    m3: 'cubic_meter',
    'm³': 'cubic_meter',
    cubic_meter: 'cubic_meter',
    l: 'liter',
    liter: 'liter',
    ml: 'milliliter',
    milliliter: 'milliliter',

    // ⏱️ WAKTU
    h: 'hour',
    hr: 'hour',
    hour: 'hour',
    d: 'day',
    day: 'day',
    w: 'week',
    week: 'week',
    mo: 'month',
    month: 'month',
  };

  return map[key] || key;
}

/**
 * Convert work done value from one unit to another
 * @param {number} value - Value to convert
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {number} Converted value
 */
export function convertWorkDone(value, fromUnit, toUnit) {
  if (!fromUnit || !toUnit || fromUnit === toUnit || typeof fromUnit !== 'string' || typeof toUnit !== 'string') return value;

  const val = Number(value) || 0;
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();

  // Length conversions
  const lengthConversions = {
  millimeter: 0.001,
  centimeter: 0.01,
  meter: 1,
  kilometer: 1000,
};

  // Area conversions
  const areaConversions = {
  square_meter: 1,
  are: 100,
  hectare: 10000,
};


  // Volume conversions
  const volumeConversions = {
    cubic_meter: 1,
    liter: 1000,
    milliliter: 1000000,
  };

  // Time conversions
  const timeConversions = {
    hour: 1,
    day: 24,
    week: 168,
    month: 720, // Assuming 30 days
  };

  // Check if both units are in the same category
  if (lengthConversions[from] && lengthConversions[to]) {
   return val * (lengthConversions[from] / lengthConversions[to]);
  }

  if (areaConversions[from] && areaConversions[to]) {
    return val * (areaConversions[from] / areaConversions[to]);
  }

  if (volumeConversions[from] && volumeConversions[to]) {
    return val * (volumeConversions[from] / volumeConversions[to]);
  }

  if (timeConversions[from] && timeConversions[to]) {
    return val * (timeConversions[from] / timeConversions[to]);
  }

  // Special case: if fromUnit is 'meter' and toUnit is 'are', treat meter as square_meter
  if (from === 'meter' && to === 'are') {
    return val / 100; // 1 are = 100 square meters
  }

  // If units are not in the same category, return original value
  return val;
}
