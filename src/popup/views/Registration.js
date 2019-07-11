import { mapState, mapGetters } from 'vuex';
import { DEFAULT_DMR_WEB_APP_URL } from '../../constants';

export default {
  computed: {
    ...mapState({
      registration: state => state.registration.registration,
    }),
    ...mapGetters('registration', ['isRegistered']),
  },
  i18n: {
    messages: {
      de: {
        heading: 'Registrierung',
        listItems: {
          userId: 'INFOnline Nutzer-ID',
          provider: 'Panelanbieter',
          createdAt: 'Erstellt',
          updatedAt: 'Aktualisiert',
        },
        buttons: {
          back: 'Zurück',
          revoke: 'widerrufen',
        },
        unknown: 'Nicht bekannt',
      },
      en: {
        heading: 'Registration',
        listItems: {
          userId: 'INFOnline User-ID',
          provider: 'Panel provider',
          createdAt: 'Created',
          updatedAt: 'Updated',
        },
        buttons: {
          back: 'Back',
          revoke: 'revoke',
        },
        unknown: 'unknown',
      },
    },
  },
  methods: {
    deregister() {
      // Create a new tab with the IMAREX registration site url
      browser.tabs.create({
        url: `${DEFAULT_DMR_WEB_APP_URL}/registration?action=revoke`,
      });
    },
  },
  name: 'Registration',
};
