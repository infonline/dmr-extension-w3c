/* eslint-disable no-param-reassign */
import { driver } from '../../scripts/driver';

const SAVE = 'SAVE';

const defaultState = () => ({
  settings: {
    id: driver.runtime.id,
    tracking: false,
    createdAt: new Date().toJSON(),
    updatedAt: undefined,
  },
});

const actions = {
  /**
   * Initializes the settings module
   *
   * @param {Function} commit - Commits mutations to the state triggered by the action
   * @returns {Promise<void>}
   */
  async init({ commit }) {
    const state = await driver.storage.local.get();
    const { settings } = state;
    if (!settings) {
      await driver.storage.local.set({
        ...state,
        settings: defaultState().settings,
      });
      commit(SAVE, defaultState().settings);
    } else {
      commit(SAVE, settings);
    }
  },
  save({ commit }, settings) {
    // We have to inform the background script over the updated settings. The background script will
    // then update the state of it's own store instance. This is necessary because of different
    // store instances between background script and popup.
    driver.runtime.sendMessage({
      from: 'IMAREX_WEB_EXTENSION',
      to: 'IMAREX_WEB_EXTENSION',
      message: {
        action: 'UPDATE_SETTINGS',
        settings,
      },
    });
    commit(SAVE, settings);
  },
};

const mutations = {
  [SAVE](state, settings) {
    state.settings = settings;
  },
};

const getters = {
  getSettings: state => state.settings,
  isActivated: state => state.settings.tracking,
};

export default {
  actions,
  getters,
  mutations,
  namespaced: true,
  state: defaultState(),
};
