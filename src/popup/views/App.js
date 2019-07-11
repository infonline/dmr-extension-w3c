import { DEFAULT_DMR_WEB_APP_URL } from '../../constants';

export default {
  name: 'app',
  computed: {
    menuItems() {
      return [
        {
          name: 'home',
          icon: 'home',
          path: {
            type: 'internal',
            href: '/',
          },
        },
        {
          name: 'registration',
          icon: 'assignment_turned_in',
          path: {
            type: 'internal',
            href: '/registration',
          },
        },
        {
          name: 'settings',
          icon: 'settings',
          path: {
            type: 'internal',
            href: '/settings',
          },
        },
        {
          name: 'privacy',
          icon: 'security',
          path: {
            type: 'external',
            href: `${DEFAULT_DMR_WEB_APP_URL}/privacy`,
          },
        },
        {
          name: 'about',
          icon: 'info',
          path: {
            type: 'internal',
            href: '/about',
          },
        },
      ];
    },
  },
  i18n: {
    messages: {
      de: {
        menuItems: ['Start', 'Registrierung', 'Einstellungen', 'Datenschutz', 'Impressum'],
        copyright: '&copy {year} INFOnline GmbH - Alle Rechte vorbehalten',
      },
      en: {
        menuItems: ['Home', 'Registration', 'Settings', 'Privacy', 'About'],
        copyright: '&copy {year} INFOnline GmbH - All rights reserved',
      },
    },
  },
  methods: {
    navigateTo(path) {
      if (path.type === 'internal') {
        // Handle path internal via router
        this.$router.push(path.href);
      } else if (path.type === 'external') {
        // Create a new tab with specified URI of external path
        browser.tabs.create({ url: path.href });
      }
    },
  },
};
