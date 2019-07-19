import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';
import '../styles/popup.css';

Vue.use(Vuetify);

export default new Vuetify({
  iconfont: 'mdi',
  theme: {
    options: {
      customProperties: true,
    },
    light: true,
    themes: {
      light: {
        primary: '#004e7b',
        secondary: '#DEDC00',
        accent: '#2db8c5',
        error: '#96181b',
        info: '#004e7b',
        success: '#4CAF50',
        warning: '#FFC107',
      },
    },
  },
});
