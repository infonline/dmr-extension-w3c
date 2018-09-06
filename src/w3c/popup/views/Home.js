/* globals IAM_PANEL_EXCHANGE_URL */
import { mapState, mapGetters } from 'vuex';
import { driver } from '../../scripts/driver';

/**
 * Retrieves the site count of the current active tab
 *
 * @param {Object} statistic - The current statistic state from the statistic vuex module
 * @returns {Promise<number>} The site count
 */
async function getSiteCount(statistic) {
  const tabs = await driver.tabs.query({ currentWindow: true, active: true });
  const tab = tabs[0];
  if (tab.url) {
    const { hostname } = new URL(tab.url);
    return hostname && statistic.sites[hostname] ? statistic.sites[hostname] : 0;
  }
  return 0;
}

/**
 * Retrieves the overall site count by iterating over all sites in the statistic state and sums up
 * all site counts.
 *
 * @param {Object} statistic - The current statistic state from the statistic vuex module
 * @returns {number} The overall site count
 */
function getOverallCount(statistic) {
  let result = 0;
  const sites = Object.keys(statistic.sites);
  for (let i = 0, iLen = sites.length; i < iLen; i += 1) {
    const site = sites[i];
    result += statistic.sites[site];
  }
  return result;
}

export default {
  name: 'Home',
  computed: {
    ...mapState({
      registration: state => state.registration.registration,
      statistic: state => state.statistic.statistic,
    }),
    ...mapGetters('registration', ['isRegistered']),
    title() {
      return 'Home';
    },
  },
  data() {
    return {
      store: {},
      siteCount: 0,
      overallCount: 0,
    };
  },
  methods: {
    register() {
      // Create a new tab with specified URI of external path
      driver.tabs.create({ url: `${IAM_PANEL_EXCHANGE_URL}/registration` });
    },
  },
  mounted() {
    setTimeout(async () => {
      this.siteCount = await getSiteCount(this.statistic);
      this.overallCount = await getOverallCount(this.statistic);
    }, 150);
  },
  updated() {
    setTimeout(async () => {
      this.siteCount = await getSiteCount(this.statistic);
      this.overallCount = await getOverallCount(this.statistic);
    }, 150);
  },
};
