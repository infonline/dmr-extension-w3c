/* globals IMAREX_LICENSES */
import { driver } from '../../scripts/driver';

export default {
  name: 'Licenses',
  computed: {
    title() {
      return 'Licenses';
    },
    licenses() {
      const licenses = JSON.parse(IMAREX_LICENSES);
      return Object.keys(licenses).map((key) => {
        const module = key.split(/@(?:.(?!@))+$/)[0];
        const version = key.split('@').slice(-1).pop();
        return {
          module,
          version,
          license: licenses[key].licenses,
          licenseUrl: licenses[key].licenseUrl,
          repository: licenses[key].repository,
        };
      });
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
