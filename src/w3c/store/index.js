import Vue from 'vue';
import Vuex from 'vuex';
import { uuidv4 } from '../scripts/utils';
import * as modules from './modules/index';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    id: uuidv4(),
    createdAt: new Date(),
  },
  modules,
  actions: {
    async init({ dispatch }) {
      await dispatch('registration/init');
      await dispatch('settings/init');
      await dispatch('statistic/init');
    },
  },
});

export default store;
