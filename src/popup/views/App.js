import { DEFAULT_DMR_WEB_APP_URL } from '../../constants';
// eslint-disable-next-line import/named
import { PreLoader } from '../components';

export default {
  name: 'app',
  components: {
    'v-pre-loader': PreLoader,
  },
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
          icon: 'account-badge',
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
          icon: 'information',
          path: {
            type: 'internal',
            href: '/about',
          },
        },
      ];
    },
  },
  data() {
    return {
      loading: true,
    };
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
  mounted() {
    // To avoid some rendering glitches we will show a preloader before the router view is activated. The preloader will be visible for 1000 ms
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  },
};
