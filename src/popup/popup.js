import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import App from './views/App.vue';
import router, { sync } from './router';
import store from '../store';
import i18n from './plugins/i18n';

Vue.config.productionTip = false;

Vue.use(Vuetify, {
  theme: {
    primary: '#004e7b',
    secondary: '#DEDC00',
    accent: '#2db8c5',
    error: '#96181b',
    info: '#004e7b',
    success: '#4CAF50',
    warning: '#FFC107',
  },
});

const unsync = sync(store, router);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  async beforeCreate() {
    // Load last route from local store
    await this.$store.dispatch('route/load', this.$router);
    // Initialize other modules
    await this.$store.dispatch('init');
  },
  beforeDestroy() {
    // Remove router <-> vuex store synchronisation
    unsync();
  },
  render: h => h(App),
});
