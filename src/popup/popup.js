import Vue from 'vue';
import vuetify from './plugins/vuetify';
import moment from './plugins/moment';
import App from './views/App.vue';
import router, { sync } from './router';
import store from '../store';
import i18n from './plugins/i18n';

Vue.config.productionTip = false;

const unsync = sync(store, router);

/* eslint-disable no-new */
new Vue({
  router,
  vuetify,
  store,
  i18n,
  moment,
  async beforeCreate() {
    // Load last route from local store
    await this.$store.dispatch('route/load', this.$router);
    // Initialize other modules
    await this.$store.dispatch('init');
    // Set language for moment plugin
    this.$moment.locale(this.$i18n.locale);
  },
  beforeDestroy() {
    // Remove router <-> vuex store synchronisation
    unsync();
  },
  render: h => h(App),
}).$mount('#app');
