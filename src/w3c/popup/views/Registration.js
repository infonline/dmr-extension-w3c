/* globals IAM_PANEL_EXCHANGE_URL */
import { mapState, mapGetters } from 'vuex';
import { driver } from '../../scripts/driver';

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
          vendor: 'Panelanbieter',
          createdAt: 'Erstellt',
          updatedAt: 'Aktualisiert',
        },
        buttons: {
          back: 'Zurück',
          remove: 'Entfernen',
        },
      },
      en: {
        heading: 'Registration',
        listItems: {
          userId: 'INFOnline User-ID',
          vendor: 'Panel provider',
          createdAt: 'Created',
          updatedAt: 'Updated',
        },
        buttons: {
          back: 'Back',
          remove: 'Remove',
        },
      },
    },
  },
  methods: {
    deregister() {
      // Create a new tab with the IMAREX registration site url
      driver.tabs.create({
        url: `${IAM_PANEL_EXCHANGE_URL}/home/registration?action=remove`,
      });
    },
  },
  name: 'Registration',
};
