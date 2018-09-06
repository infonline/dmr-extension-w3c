/* globals IMAREX_VERSION, IAM_PANEL_EXCHANGE_URL */
import UaParser from 'ua-parser-js';
import { driver } from '../../scripts/driver';

export default {
  name: 'About',
  computed: {
    title() {
      return 'About';
    },
    browser() {
      const parser = new UaParser();
      return parser.getBrowser();
    },
    version() {
      return IMAREX_VERSION;
    },
    links() {
      return {
        privacy: `${IAM_PANEL_EXCHANGE_URL}/privacy`,
        bugs: `${IAM_PANEL_EXCHANGE_URL}/report?type=bug`,
      };
    },
  },
  methods: {
    createTab(url) {
      driver.tabs.create({
        url,
      });
    },
  },
};
