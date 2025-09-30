import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

/**
 * Format date as D. MMM YYYY
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const day = date => {
  if (!date) return '';
  return dayjs(date).format(DATE_FORMATS.SHORT_DATE);
};

/**
 * Format time as H:mm with hour suffix
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time
 */
export const time = date => {
  if (!date) return '';
  return dayjs(date).format(DATE_FORMATS.TIME) + 'h';
};

export const dateTime = datetime => {
  if (!datetime) return '';
  return dayjs(datetime).format(DATE_FORMATS.FULL_DATE) + 'h';
};

/**
 * Get relative time difference
 * @param {string|Date} datetime - Date to compare
 * @param {boolean} withoutSuffix - Remove ago/in prefix
 * @returns {string} Relative time
 */
export const diffForHumans = (datetime, withoutSuffix = false) => {
  if (!datetime) return '';
  return dayjs(datetime).fromNow(withoutSuffix);
};

/**
 * Check if date is valid
 * @param {string|Date} date - Date to check
 * @returns {boolean} Is valid date
 */
export const isValidDate = date => {
  return dayjs(date).isValid();
};

/**
 * Format date as DD/MM/YYYY
 * @param {string|Date} date
 * @returns {string} Formatted date
 */
export const dateSlash = date => {
  if (!date) return '';
  return dayjs(date).format(DATE_FORMATS.SLASH_DATE);
};

/**
 * Convert duration from days to specified unit
 * @param {number} days - Duration in days
 * @param {string} unit - Unit to convert to ('day', 'week', 'month')
 * @returns {number} Converted duration
 */
export const convertDurationFromDays = (days, unit) => {
  // Handle cases where days might be null, undefined, or negative
  if (days === null || days === undefined || days < 0) return 0;
  if (days === 0) return 0;

  switch (unit) {
    case 'day':
      return days;
    case 'week':
      return Math.round(days / 7);
    case 'month':
      return Math.round(days / 30);
    default:
      return days; // Default to days if unit is not recognized
  }
};

/**
 * Get a label for the unit with proper pluralization and formatting
 * @param {string} unit - Unit name ('day', 'week', 'month')
 * @param {number} count - Count to determine plural form
 * @returns {string} - Formatted label
 */
export const getUnitLabel = (unit, count) => {
  const capitalizedUnit = unit.charAt(0).toUpperCase() + unit.slice(1);

  if (count === null || count === undefined) return capitalizedUnit;
  if (count < 0) return `-${capitalizedUnit}s`;
  if (count === 0) return `No ${capitalizedUnit}s`;
  if (count === 1) return capitalizedUnit;

  return `${capitalizedUnit}s`;
};

/**
 * formater export
 */
export const DATE_FORMATS = {
  SHORT_DATE: 'D. MMM YYYY',
  TIME: 'H:mm',
  FULL_DATE: 'D. MMM YYYY H:mm',
  ISO: 'YYYY-MM-DD',
  DAY_NAME: 'dddd',
  SLASH_DATE: 'DD/MM/YYYY',
};
