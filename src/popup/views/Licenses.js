import { LICENSES } from '../../constants';

export default {
  name: 'Licenses',
  computed: {
    title() {
      return 'Licenses';
    },
    licenses() {
      return Object.keys(LICENSES).map((key) => {
        const module = key.split(/@(?:.(?!@))+$/)[0];
        const version = key.split('@').slice(-1).pop();
        return {
          module,
          version,
          license: LICENSES[key].licenses,
          licenseUrl: LICENSES[key].licenseUrl,
          repository: LICENSES[key].repository,
        };
      });
    },
  },
  i18n: {
    messages: {
      de: {
        headline: 'Lizenzen',
        listItems: {
          module: 'Modul',
          version: 'Version',
          type: 'Typ',
          url: 'Url',
          repository: 'Quelle',
        },
        link: 'Klick',
        buttons: {
          back: 'Zurück',
        },
      },
      en: {
        headline: 'Licenses',
        listItems: {
          module: 'Module',
          version: 'Version',
          type: 'Typ',
          url: 'Url',
          repository: 'Repository',
        },
        link: 'click',
        buttons: {
          back: 'back',
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
