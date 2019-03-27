import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import App from './views/App.vue';
import router from './router';
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

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App),
  beforeCreate() {
    this.$store.dispatch('init');
  },
});
