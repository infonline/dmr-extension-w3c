import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState({
      settings: state => state.settings.settings,
      registration: state => state.registration.registration,
    }),
  },
  i18n: {
    messages: {
      de: {
        buttons: {
          cancel: 'Abbrechen',
          save: 'Speichern',
        },
        headline: 'Einstellungen',
        listItems: {
          tracking: {
            label: 'Messung',
            text: 'aktiviert | deaktiviert',
          },
        },
      },
      en: {
        buttons: {
          cancel: 'Cancel',
          save: 'Save',
        },
        headline: 'Settings',
        listItems: {
          tracking: {
            label: 'Measurement',
            text: 'activated | deactivated',
          },
        },
      },
    },
  },
  methods: {
    ...mapActions('settings', ['save']),
    handleClick(settings) {
      this.save(settings);
      setTimeout(() => this.$router.push('/'), 150);
    },
  },
  name: 'Settings',
};
