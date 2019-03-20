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
