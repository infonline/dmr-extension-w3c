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
