/* eslint-disable no-param-reassign */

import { driver } from '../../scripts/driver';

const SAVE = 'SAVE';

const defaultState = () => ({
  statistic: {
    requests: [],
    sites: {},
    events: {},
    createdAt: new Date().toJSON(),
    updatedAt: undefined,
  },
});
/**
 * Finds the last index in the request collection which date is older than one month from now
 *
 * @param {Array} requests - Collection of requests
 * @return {*|number|never} The index of the first element which meets the condition
 */
const findLastRequestIndex = (requests) => {
  const now = new Date();
  const last = now.setMonth(now.getMonth() - 1);
  return requests.findIndex(request => Date.parse(request.date) < last);
};

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
    if (localState.statistic && Object.keys(localState.statistic).includes('createdAt')) {
      state.statistic = localState.statistic;
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
   * @param {Object} state - Current module state
   * @param {String} type = 'type' | type = 'site' - The dictionary type
   * @param {String} event - Name of the event
   * @param {String} site - The key of the dictionary entry
   * @returns {Promise<void>} Void
   */
  async update({ commit, state }, { type, event, site }) {
    const localState = await driver.storage.local.get();
    if (localState.statistic && Object.keys(localState.statistic).includes('createdAt')) {
      state.statistic = localState.statistic;
    }
    const { statistic } = state;
    // Create aggregated data
    if (type === 'count') {
      const { sites } = statistic;
      if (!sites[site]) {
        sites[site] = 0;
      }
      sites[site] += 1;
      statistic.updatedAt = new Date().toJSON();
    } else if (type === 'navigation') {
      const { events } = statistic;
      if (!events[event]) {
        events[event] = 0;
      }
      events[event] += 1;
    }
    // Save the request
    let { requests } = statistic;
    if (!requests) {
      // eslint-disable-next-line no-param-reassign
      requests = [];
    }
    const lastAllowedRequestIndex = findLastRequestIndex(requests);
    if (lastAllowedRequestIndex > -1) {
      requests = requests.slice(lastAllowedRequestIndex, requests);
    }
    const request = {
      event,
      site,
      type,
      date: new Date().toJSON(),
    };
    requests.push(request);
    statistic.requests = requests;
    statistic.updatedAt = new Date().toJSON();
    await driver.storage.local.set({
      ...state,
      statistic,
    });
    commit(SAVE, statistic);
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
