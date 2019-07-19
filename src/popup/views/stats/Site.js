import { mapState } from 'vuex';
import VueApexCharts from 'vue-apexcharts';
import { ChartControl } from '../../components';
import store from '../../../store';

/**
 * Gets the site host from the active tab url
 *
 * @return {Promise<string>} Site host from the active tab url
 */
const getSite = async () => {
  let site;
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
  const tab = tabs[0];
  if (tab.url) {
    const { hostname } = new URL(tab.url);
    site = hostname;
  }
  return site;
};

export default {
  /**
   * Before route enter guard. Will initialize the vuex modules statistic and chart
   *
   * @param {...Array} args - Route arguments
   * @return {Promise<void>} Void
   */
  async beforeRouteEnter(...args) {
    const [,, next] = args;
    await store.dispatch('statistic/init');
    next();
  },
  components: {
    'v-chart': VueApexCharts,
    'v-chart-control': ChartControl,
  },
  computed: {
    ...mapState('charts', ['siteUsage', 'timeRanges']),
  },
  /**
   * Components data creator
   *
   * @return {{timeRange: string}}
   */
  data() {
    return {
      timeRange: 'today',
    };
  },
  i18n: {
    messages: {
      de: {
        timeRanges: {
          label: 'Zeitraum',
        },
      },
      en: {
        timeRanges: {
          label: 'Time range',
        },
      },
    },
  },
  name: 'StatsSiteView',
  methods: {
    /**
     * Reloads the data of a given chart type
     *
     * @param {String} chartType - The chart type to reload
     */
    async reload(chartType) {
      if (chartType && ['siteUsage', 'top5Events'].includes(chartType)) {
        const { timeRange } = this;
        const site = await getSite();
        // Reload chart data via vuex module action
        this.$store.dispatch('charts/reload', {
          chartType,
          timeRange,
          locale: this.$i18n.locale,
          site,
        });
      }
    },
    /**
     * Toggles the timeRange by setting the current timeRange property which is bound to the selection and will emit the reload action to rebuild
     * the chart data. This will trigger a view update because state of the mapped vuex module was mutated.
     *
     * @param {String} timeRange
     */
    async toggleRange(timeRange) {
      if (timeRange) {
        const site = await getSite();
        this.timeRange = timeRange;
        // Reload chart data via vuex module action
        this.$store.dispatch('charts/reload', {
          chartType: 'siteUsage',
          timeRange,
          locale: this.$i18n.locale,
          site,
        });
      }
    },
  },
  /**
   * Mounted lifecycle hook
   */
  async mounted() {
    const site = await getSite();
    // Reload chart data via vuex module action
    this.$store.dispatch('charts/reload', {
      chartType: 'siteUsage',
      timeRange: 'today',
      locale: this.$i18n.locale,
      site,
    });
  },
};
