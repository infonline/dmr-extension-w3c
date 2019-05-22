/* globals IAM_PANEL_EXCHANGE_URL */
import { driver } from '../../scripts/driver';

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
            href: `${IAM_PANEL_EXCHANGE_URL}/home/privacy`,
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
        driver.tabs.create({ url: path.href });
      }
    },
  },
};
