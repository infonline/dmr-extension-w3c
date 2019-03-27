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
            href: `${IAM_PANEL_EXCHANGE_URL}/privacy`,
          },
        },
        {
          name: 'help',
          icon: 'help',
          path: {
            type: 'internal',
            href: '/help',
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
        menuItems: ['Start', 'Registrierung', 'Einstellungen', 'Datenschutz', 'Hilfe', 'Impressum'],
      },
      en: {
        menuItems: ['Home', 'Registration', 'Settings', 'Privacy', 'Help', 'About'],
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
