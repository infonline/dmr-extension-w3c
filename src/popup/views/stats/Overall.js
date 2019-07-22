import { mapState } from 'vuex';
import VueApexCharts from 'vue-apexcharts';
import { ChartControl } from '../../components';
import store from '../../../store';

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
    ...mapState('charts', ['overallUsage', 'timeRanges', 'top5Events', 'top5Websites']),
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
        noData: 'Keine Daten vorhanden.',
      },
      en: {
        timeRanges: {
          label: 'Time range',
        },
        noData: 'No data available.',
      },
    },
  },
  name: 'StatsOverallView',
  methods: {
    /**
     * Reloads the data of a given chart type
     *
     * @param {String} chartType - The chart type to reload
     */
    reload(chartType) {
      if (chartType && ['overallUsage', 'top5Events', 'top5Websites'].includes(chartType)) {
        const { timeRange } = this;
        // Reload chart data via vuex module action
        this.$store.dispatch('charts/reload', { chartType, timeRange, locale: this.$i18n.locale });
      }
    },
    /**
     * Toggles the range by setting the current range property which is bound to the selection and will emit the reload action to rebuild the chart
     * data. This will trigger a view update because state of the mapped vuex module was mutated.
     *
     * @param {String} timeRange - Selected time range
     */
    toggleRange(timeRange) {
      if (timeRange) {
        this.timeRange = timeRange;
        // Reload chart data via vuex module action
        this.$store.dispatch('charts/reload', { chartType: 'overallUsage', timeRange, locale: this.$i18n.locale });
      }
    },
  },
  /**
   * Mounted lifecycle hook
   */
  mounted() {
    // Reload chart data via vuex module action
    ['overallUsage', 'top5Events', 'top5Websites'].forEach(chartType => this.reload(chartType));
  },
};
