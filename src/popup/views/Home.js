import { mapState, mapGetters } from 'vuex';
import { DEFAULT_DMR_WEB_APP_URL } from '../../constants';

/**
 * Retrieves the site count of the current active tab
 *
 * @param {Object} statistic - The current statistic state from the statistic vuex module
 * @returns {Promise<number>} The site count
 */
async function getSiteCount(statistic) {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
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
    ...mapGetters('registration', ['isRegistered', 'isConfirmed']),
    ...mapGetters('settings', ['isActivated']),
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
  i18n: {
    messages: {
      de: {
        status: {
          headline: 'Status',
          buttons: {
            details: 'Details',
            register: 'Registrieren',
            activate: 'Aktivieren',
          },
        },
        site: {
          headline: 'Webseite',
          button: 'Details',
        },
        overall: {
          headline: 'Gesamt',
          button: 'Details',
        },
      },
      en: {
        status: {
          headline: 'Status',
          buttons: {
            details: 'Details',
            register: 'Register',
            activate: 'Activate',
          },
        },
        site: {
          headline: 'Web site',
          button: 'Details',
        },
        overall: {
          headline: 'Overall',
          button: 'Details',
        },
      },
    },
  },
  methods: {
    /**
     * Creates a new tab with registration site url
     */
    register() {
      // Create a new tab with specified URI of external path
      browser.tabs.create({ url: `${DEFAULT_DMR_WEB_APP_URL}/registration` });
    },
    /**
     * Gets the color for the status panel defined by the current extension state
     *
     * @return {String} Color name
     */
    getColor() {
      if (this.isConfirmed && !this.isActivated) {
        return 'orange';
      }
      if (!this.isConfirmed && !this.isActivated) {
        return 'red';
      }
      return 'green';
    },
    /**
     * Gets the icon name for the status panel defined by the current enxtension state
     *
     * @return {String} Name the icon
     */
    getIcon() {
      if (this.isConfirmed && !this.isActivated) {
        return 'warning';
      }
      if (!this.isConfirmed && !this.isActivated) {
        return 'cancel';
      }
      return 'check_circle';
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
