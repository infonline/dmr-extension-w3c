import Bowser from 'bowser/src/bowser';
import { DEFAULT_DMR_WEB_APP_URL } from '../../constants';

export default {
  name: 'About',
  computed: {
    title() {
      return 'About';
    },
    browser() {
      const parser = Bowser.getParser(window.navigator.userAgent);
      return parser.getBrowser();
    },
    version() {
      return browser.runtime.getManifest().version;
    },
    links() {
      return {
        privacy: `${DEFAULT_DMR_WEB_APP_URL}/privacy`,
        bugs: `${DEFAULT_DMR_WEB_APP_URL}/report?type=bug`,
      };
    },
  },
  i18n: {
    messages: {
      de: {
        headline: 'Informationen zur Browsererweiterung',
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
      browser.tabs.create({
        url,
      });
    },
  },
};
