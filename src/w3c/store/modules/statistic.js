/* eslint-disable no-param-reassign */

import { driver } from '../../scripts/driver';

const SAVE = 'SAVE';

const defaultState = () => ({
  statistic: {
    sites: {},
    types: {},
    createdAt: new Date().toJSON(),
    updatedAt: undefined,
  },
});

const actions = {
  /**
   * Initializes the statistic module
   *
   * @param commit - Commits mutations to the state triggered by the action
   * @param state - Current module state
   * @returns {Promise<void>} Void
   */
  async init({ commit, state }) {
    const localState = await driver.storage.local.get();
    if (localState && Object.keys(localState).includes('createdAt')) {
      state = localState;
    }
    let { statistic } = state;
    if (!statistic) {
      statistic = {
        ...defaultState.statistic,
        createdAt: new Date().toJSON(),
      };
      await driver.storage.local.set({
        ...state,
        statistic,
      });
    }
    commit(SAVE, statistic);
  },
  /**
   * Updates the statistics dictionary
   *
   * @param {Function} commit  - Commits mutations to the state triggered by the action
   * @param state - Current module state
   * @param {String} [type = 'type' | type = 'site'] - The dictionary type
   * @param {String} key - The key of the dictionary entry
   * @returns {Promise<void>} Void
   */
  async update({ commit, state }, { type, key }) {
    const localState = await driver.storage.local.get();
    if (localState && Object.keys(localState).includes('createdAt')) {
      state = localState;
    }
    const { statistic } = state;
    if (type === 'site') {
      const { sites } = statistic;
      if (!sites[key]) {
        sites[key] = 0;
      }
      sites[key] += 1;
      statistic.updatedAt = new Date().toJSON();
      await driver.storage.local.set({
        ...state,
        statistic,
      });
      commit(SAVE, statistic);
    } else if (type === 'type') {
      const { types } = statistic;
      if (!types[key]) {
        types[key] = 0;
      }
      types[key] += 1;
      statistic.updatedAt = new Date().toJSON();
      await driver.storage.local.set({
        ...state,
        statistic,
      });
      commit(SAVE, statistic);
    }
  },
};

const mutations = {
  [SAVE](state, statistic) {
    state.statistic = statistic;
  },
};

const getters = {
  /**
   * Gets the current statistic dictionary
   *
   * @param {Object} state - The current module state
   * @returns {*|defaultState.statistic|{}|statistic}
   */
  getStatistic: state => state.statistic,
};

export default {
  actions,
  getters,
  mutations,
  namespaced: true,
  state: defaultState(),
};
