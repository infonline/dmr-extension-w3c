/* eslint-disable no-param-reassign */
import { log } from '../../common/utils';
import {
  MESSAGE_ACTIONS,
  MESSAGE_DIRECTIONS,
} from '../../constants';
// Mutation types
const SAVE = 'SAVE';
/**
 * Default state factory
 *
 * @return {{settings: {createdAt: string, id: *, tracking: boolean, updatedAt: undefined}}}
 */
const defaultState = () => ({
  settings: {
    id: browser.runtime.id,
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
    try {
      const store = await browser.storage.local.get();
      let { settings } = store;
      if (!settings) {
        // eslint-disable-next-line prefer-destructuring
        settings = defaultState().settings;
        await browser.storage.local.set({ settings });
      }
      commit(SAVE, settings);
    } catch (error) {
      log('error', error);
    }
  },
  /**
   * Saves the settings
   *
   * @param {Function} commit - Method for commit mutations of local module state
   * @param {Object} settings - Updated extension settings
   */
  async save({ commit }, settings) {
    try {
      // Persistent settings
      await browser.storage.local.set({ settings });
      // Commit state mutation
      commit(SAVE, settings);
      // Inform the background script to inform tabs who have the dmr web application open
      browser.runtime.sendMessage({
        from: MESSAGE_DIRECTIONS.EXTENSION,
        to: MESSAGE_DIRECTIONS.WEB_APP,
        message: {
          action: MESSAGE_ACTIONS.UPDATE_SETTINGS,
          settings,
        },
      });
    } catch (error) {
      log('error', error);
    }
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
