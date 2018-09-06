import { mapState, mapGetters } from 'vuex';

export default {
  computed: {
    ...mapState({
      registration: state => state.registration.registration,
    }),
    ...mapGetters('registration', ['isRegistered']),
  },
  name: 'Registration',
};
