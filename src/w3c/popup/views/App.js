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
          label: 'Home',
          path: {
            type: 'internal',
            href: '/',
          },
        },
        {
          name: 'registration',
          icon: 'assignment_turned_in',
          label: 'Registration',
          path: {
            type: 'internal',
            href: '/registration',
          },
        },
        {
          name: 'settings',
          icon: 'settings',
          label: 'Settings',
          path: {
            type: 'internal',
            href: '/settings',
          },
        },
        {
          name: 'privacy',
          icon: 'security',
          label: 'Privacy',
          path: {
            type: 'external',
            href: `${IAM_PANEL_EXCHANGE_URL}/privacy`,
          },
        },
        {
          name: 'help',
          icon: 'help',
          label: 'Help',
          path: {
            type: 'internal',
            href: '/help',
          },
        },
        {
          name: 'about',
          icon: 'info',
          label: 'About',
          path: {
            type: 'internal',
            href: '/about',
          },
        },
      ];
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
