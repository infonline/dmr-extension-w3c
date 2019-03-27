import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState({
      settings: state => state.settings.settings,
    }),
    title() {
      return 'Settings';
    },
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
            label: 'Tracking',
            text: 'INFOnline Tracking deaktivieren | INFOnline Tracking aktivieren',
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
            label: 'Tracking',
            text: 'Disable INFOnline tracking | Enable INFOnline tracking',
          },
        },
      },
    },
  },
  methods: {
    ...mapActions('settings', {
      saveSettings: 'save',
    }),
    save(settings) {
      this.saveSettings(settings);
      this.$router.push('/');
    },
  },
  name: 'Settings',
};
