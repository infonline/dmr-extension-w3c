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
  i18n: {
    messages: {
      de: {
        headline: 'Impressum',
        listItems: {
          name: {
            label: 'Name',
          },
          description: {
            label: 'Beschreibung',
            text: 'Browsererweiterung zur Markforschung für {browser}',
          },
          version: {
            label: 'Version',
          },
          licenses: {
            label: 'Lizenzen',
          },
          privacy: {
            label: 'Datenschutz',
          },
          bugs: {
            label: 'Fehler melden',
          },
        },
        buttons: {
          back: 'Zurück',
        },
      },
      en: {
        headline: 'About',
        listItems: {
          name: {
            label: 'Name',
          },
          description: {
            label: 'Description',
            text: 'Browser extension for marketing research in {browser}',
          },
          version: {
            label: 'Version',
          },
          licenses: {
            label: 'Licenses',
          },
          privacy: {
            label: 'Privacy',
          },
          bugs: {
            label: 'Report a bug',
          },
        },
        buttons: {
          back: 'Zurück',
        },
      },
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
