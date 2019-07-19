import merge from 'lodash-es/merge';
import cloneDeep from 'lodash-es/cloneDeep';
import {
  COLORS,
  BAR_CHART,
  PIE_CHART,
  OVERALL_USAGE_CHART,
  SITE_USAGE_CHART,
  TIME_RANGES,
  TOP_5_EVENTS,
  TOP_5_WEBSITES,
} from '../../constants';

const RELOAD = 'RELOAD';

const defaultState = (locale = 'en') => {
  const lang = locale.toUpperCase();
  return {
    overallUsage: cloneDeep(merge(BAR_CHART.BASE, BAR_CHART[lang], OVERALL_USAGE_CHART[lang])),
    siteUsage: cloneDeep(merge(BAR_CHART.BASE, BAR_CHART[lang], SITE_USAGE_CHART[lang])),
    top5Events: cloneDeep(merge(PIE_CHART.BASE, PIE_CHART[lang], TOP_5_EVENTS[lang])),
    top5Websites: cloneDeep(merge(PIE_CHART.BASE, PIE_CHART[lang], TOP_5_WEBSITES[lang])),
    timeRanges: TIME_RANGES[lang].map(item => ({ ...item, callback: () => {} })),
  };
};

/**
 * Normalize date by setting minute and second to 0 and if aggregation step is day or hour it will also set hours to 0
 *
 * @param {Date} date - Date to normalize
 * @param {String} aggregation - The aggregation step
 * @return {Date} Normalized date
 */
const normalizeDate = (date, aggregation) => {
  if (aggregation === 'day' || aggregation === 'month') {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0);
};

/**
 * Gets the monday from a provided date
 *
 * @param {Date} date - The provided date to determine the the monday date from
 * @return {Date} Monday as date
 */
const getMonday = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  result.setDate(diff);
  return normalizeDate(result, 'day');
};

/**
 * Determines the min and max dates from a given timeRange
 *
 * @param {String} timeRange - The timeRange key
 * @return {{min: Date, max: Date}} Min and max date
 */
const determineMinMaxFromRange = (timeRange) => {
  const today = new Date();
  let result;
  if (timeRange === 'yesterday') {
    // Determine min and max for yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const min = normalizeDate(yesterday, 'day');
    const max = normalizeDate(today, 'day');
    result = {
      min,
      max,
    };
  } else if (timeRange === 'currentWeek') {
    // Determine min and max for current week
    const day = today.getDay();
    const monday = day === 1 ? normalizeDate(today, 'day') : getMonday(today);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    result = {
      min: monday,
      max: sunday,
    };
  } else if (timeRange === 'lastWeek') {
    // Determine min and max for last week
    const date = new Date(today);
    date.setDate(date.getDate() - 7);
    const day = date.getDay();
    const monday = day === 1 ? normalizeDate(date, 'day') : getMonday(date);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    result = {
      min: monday,
      max: sunday,
    };
  } else if (timeRange === 'currentMonth') {
    // Determine min and max for current month
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    result = {
      min: first,
      max: last,
    };
  } else if (timeRange === 'lastMonth') {
    // Determine min and max for last month
    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const last = new Date(today.getFullYear(), today.getMonth(), 0);
    result = {
      min: first,
      max: last,
    };
  } else {
    // Determine min an max for today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const min = normalizeDate(today, 'day');
    const max = normalizeDate(tomorrow, 'day');
    result = {
      min,
      max,
    };
  }
  return result;
};
/**
 *
 * @param {Date} min - Minimum date timeRange
 * @param {Date} max - Maximum date timeRange
 * @param {String} [aggregation=hour] - Optional aggregation (hour by default)
 * @return {[{start: Date, end: Date}]} Collection start and end dates
 */
const createTimeRanges = ({ min, max }, aggregation = 'hour') => {
  const result = [];
  const from = new Date(min); // Date is mutable and mutations are inherited so we make new instance of min and max
  const to = new Date(max);
  if (aggregation === 'day') {
    // Aggregation is day
    while (from < to) {
      const start = normalizeDate(from, aggregation);
      const end = normalizeDate(from, aggregation);
      end.setDate(from.getDate() + 1);
      result.push({ start, end });
      from.setDate(from.getDate() + 1);
    }
  } else if (aggregation === 'month') {
    // Aggregation is month
    while (from < to) {
      const start = normalizeDate(from, aggregation);
      const end = normalizeDate(from, aggregation);
      end.setMonth(from.getMonth() + 1);
      result.push({ start, end });
      from.setMonth(from.getMonth() + 1);
    }
  } else {
    // Hour by default
    while (from < to) {
      const start = normalizeDate(from, aggregation);
      const end = normalizeDate(from, aggregation).setHours(from.getHours() + 1);
      result.push({ start, end });
      from.setHours(from.getHours() + 1);
    }
  }
  return result;
};

/**
 * Determines the possible aggregation step by the provided timeRange key
 *
 * @param {String} timeRange - The timeRange key
 * @return {string} The aggregation step
 */
const determineAggregation = (timeRange) => {
  let aggregation = 'hour';
  if (timeRange.toLowerCase().includes('week') || timeRange.toLowerCase().includes('month')) {
    aggregation = 'day';
  }
  return aggregation;
};

/**
 * Creates the overall data by extracting them from the provided statistic data with the given type (running time worst case O(n^2))
 *
 * @param {{requests: []}} statistic - Statistic with requests as object
 * @param {String} timeRange - time range key
 * @param {String} type - Request type
 * @param {String} [site] - Optional site to filter the statistic by site
 * @return {Array<Number>} Collection of overall data
 */
const createTimeRangeData = (statistic, timeRange, type, site) => {
  const results = [];
  // Determine aggregation step from provided timeRange key
  const aggregation = determineAggregation(timeRange);
  // Determine minimum date from provided timeRange
  const minMaxTimeRanges = determineMinMaxFromRange(timeRange);
  // Create date timeRanges from min and max date and from provided aggregation
  const timeRanges = createTimeRanges(minMaxTimeRanges, aggregation);
  // Filter request statistic according to the determined min and max date timeRange
  const data = statistic.requests
    .filter((item) => {
      if (site === undefined) {
        return item.type === type && Date.parse(item.date) > minMaxTimeRanges.min && Date.parse(item.date) < minMaxTimeRanges.max;
      }
      return item.type === type && item.site === site && Date.parse(item.date) > minMaxTimeRanges.min && Date.parse(item.date) < minMaxTimeRanges.max;
    });
  if (data.length > 0) {
    // Iterate through date timeRanges and find items in data which date is between the atomically date timeRange
    timeRanges.forEach((range) => {
      const { start, end } = range;
      // Filter data which date is between start and end
      const items = data.filter(item => Date.parse(item.date) >= start && Date.parse(item.date) < end);
      // Push the item count to result collection
      results.push({ x: start, y: items.length });
    });
  }
  return results;
};

/**
 * Creates a i18n aware collection of hours
 *
 * @param {String} locale - The i18n locale
 * @return {Array<String>} Collection of hours
 */
const createHourCategories = (locale) => {
  const hours = [];
  let i = 1;
  const iLen = 24;
  for (;i <= iLen; i += 1) {
    const suffix = locale === 'en' ? `h ${i >= 12 ? 'pm' : 'am'}` : 'Uhr';
    let hour;
    if (locale === 'en') {
      hour = `${i % 12} ${suffix}`;
    } else {
      hour = `${i} ${suffix}`;
    }
    hours.push(hour);
  }
  return hours;
};

/**
 * Creates a i18n aware collection of weekdays
 *
 * @param {String} locale - The i18n locale
 * @return {Array<String>} - Collection of weekdays
 */
const createWeekdayCategories = (locale) => {
  if (locale === 'en') {
    return ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  }
  return ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
};

/**
 * Creates for the provided timeRange a collection of 18n aware days
 *
 * @param {{min: Date, max: Date }} timeRange
 * @param {String} locale - The i18n locale
 * @return {Array} Collection of days
 */
const createDayCategories = (timeRange, locale) => {
  const results = [];
  const {
    min,
    max,
  } = timeRange;
  while (min < max) {
    const current = min.getDate();
    const month = min.toLocaleString(locale, { month: 'short' });
    results.push(`${current} ${month}`);
    min.setDate(min.getDate() + 1);
  }
  return results;
};
/**
 * Creates the categories determined by th provided timeRange and the i18n locale
 *
 * @param {String} timeRange - The timeRange key
 * @param {String} locale - The i18n locale
 * @return {Array<String>} - Collection of chart categories
 */
const createUsageCategories = (timeRange, locale) => {
  let categories = [];
  if (timeRange.toLowerCase().includes('day')) {
    categories = createHourCategories(locale);
  } else if (timeRange.toLowerCase().includes('week')) {
    categories = createWeekdayCategories(locale);
  } else if (timeRange.toLowerCase().includes('month')) {
    const minMaxRange = determineMinMaxFromRange(timeRange);
    categories = createDayCategories(minMaxRange, locale);
  }
  return categories;
};

/**
 * Creates ascended slices bound by a provided limit
 *
 * @param {Object<Number>} data - Dictionary of aggregated data
 * @param {Number} limit - The limit of slices in the result array
 * @return {{label: string, value: Number}[]}
 */
const createSlices = (data, limit) => {
  const sorted = Object.entries(data).sort(([, s1], [, s2]) => s2 - s1);
  const slices = sorted.slice(0, sorted.length > limit ? limit : sorted.length);
  return slices.map(slice => ({ label: slice[0], value: slice[1] }));
};

/**
 * Creates the colors from the defined color pallets
 *
 * @param {Array} [pallets] - Optional color pallets
 * @return {Array} Colors as array
 */
const createColors = (pallets = COLORS.pallets) => {
  const colors = [];
  COLORS.allowedColors.forEach((colorKey) => {
    pallets.forEach((paletteKey) => {
      colors.push(COLORS[paletteKey][colorKey]);
    });
  });
  return colors;
};

const actions = {
  /**
   * Recreates the chart options of a specific chart type
   *
   * @param {Function} commit - State mutation commit function
   * @param {Object} rootState - State of all initialized and mounted vuex modules
   * @param {String} chartType - Chart type to be reloaded with new options
   * @param {String} timeRange - The time timeRange
   * @param {String} locale - The i18n locale
   * @param {String} [site] - Optional site
   */
  reload({
    commit,
    rootState,
  }, {
    chartType,
    timeRange,
    locale,
    site,
  }) {
    const { statistic } = rootState.statistic;
    const state = defaultState(locale);
    const { timeRanges } = state;
    const chart = state[chartType];
    if (chartType === 'overallUsage') {
      chart.series[0].data = createTimeRangeData(statistic, timeRange, 'count');
      chart.series[1].data = createTimeRangeData(statistic, timeRange, 'navigation');
      chart.options.title.text += ` ${timeRanges.find(item => item.value === timeRange).text}`;
    } else if (chartType === 'siteUsage' && site !== undefined) {
      chart.series[0].data = createTimeRangeData(statistic, timeRange, 'count', site);
      chart.series[1].data = createTimeRangeData(statistic, timeRange, 'navigation', site);
      chart.options.title.text += ` ${timeRanges.find(item => item.value === timeRange).text}`;
      chart.options.subtitle.text = `${locale === 'en' ? 'Website:' : 'Webseite:'} ${site}`;
      chart.options.subtitle.style = { fontSize: '12px', color: '#9E9E9E' };
      chart.options.xaxis.categories = createUsageCategories(timeRange, locale);
    } else if (chartType === 'top5Events' || chartType === 'top5Websites') {
      const slices = createSlices(chartType === 'top5Events' ? statistic.events : statistic.sites, 5);
      chart.series = slices.map(slice => slice.value);
      chart.options.labels = slices.map(slice => slice.label);
      chart.options.colors = createColors().slice(0, slices.length);
    }
    commit(RELOAD, { chartType, chart, timeRanges });
  },
};

const mutations = {
  [RELOAD](state, { chartType, chart, timeRanges }) {
    // eslint-disable-next-line no-param-reassign
    state[chartType] = chart;
    // eslint-disable-next-line no-param-reassign
    state.timeRanges = timeRanges;
  },
};

export default {
  actions,
  mutations,
  namespaced: true,
  state: defaultState(),
};
