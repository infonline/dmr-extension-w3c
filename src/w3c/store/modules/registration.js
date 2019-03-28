/* eslint-disable no-param-reassign */
/* globals IAM_PANEL_EXCHANGE_URL */
import { driver } from '../../scripts/driver';
import { uuidv4 } from '../../scripts/utils';

const SAVE = 'SAVE';

const defaultState = {
  registration: {
    installationId: undefined,
    userId: undefined,
    panelId: undefined,
    vendor: undefined,
    createdAt: new Date().toJSON(),
    updatedAt: undefined,
  },
};

const actions = {
  /**
   * Initializes the registration module
   *
   * @param {Function} commit - Commits mutations to the state triggered by the action
   * @param {Function} dispatch - Dispatches local actions or actions from other modules
   * @returns {Promise<void>} Void
   */
  async init({ commit, dispatch }) {
    const state = await driver.storage.local.get();
    let { registration } = state;
    // Create installation ID and user ID when not defined in local extension storage
    if (!registration) {
      registration = {
        ...defaultState.registration,
        userId: uuidv4(),
        installationId: uuidv4(),
        createdAt: new Date().toJSON(),
      };
      const newState = {
        ...state,
        registration,
      };
      // Persistent state
      await driver.storage.local.set(newState);
      dispatch('settings/save', { tracking: false }, { root: true });
      // Create a new tab with the IMAREX registration site url
      driver.tabs.create({
        url: `${IAM_PANEL_EXCHANGE_URL}/home/registration`,
      });
    }
    // Set the uninstall url which should be opened when the extension is uninstalled
    if (registration.userId && registration.vendor) {
      driver.runtime
        .setUninstallURL(`${IAM_PANEL_EXCHANGE_URL}/home/registration?action=remove&userId=${registration.userId}&vendor=${registration.vendor}`);
    }
    // Commit state mutation
    commit(SAVE, registration);
  },
  /**
   * Saves the current registration state persistent
   *
   * @param {Function} commit - Commits mutations to the state triggered by the action
   * @param {Function} dispatch - Dispatches local actions or actions from other modules
   * @param {Object} data - Registration data
   * @return {Promise<void>} Void
   */
  async save({ commit, dispatch }, data) {
    const state = await driver.storage.local.get();
    let { registration } = state;
    registration = {
      ...registration,
      ...data,
      updatedAt: new Date().toJSON(),
    };
    const newState = {
      ...state,
      registration,
    };
    // Set the uninstall url which should be opened when the extension is uninstalled
    if (registration.userId && registration.vendor) {
      driver.runtime
        .setUninstallURL(`${IAM_PANEL_EXCHANGE_URL}/home/registration?action=remove&userId=${registration.userId}&vendor=${registration.vendor}`);
    }
    // Activate tracking when panel and vendor identifier are set
    if (registration.panelId && registration.vendor) {
      dispatch('settings/save', { tracking: true }, { root: true });
    }
    await driver.storage.local.set(newState);
    commit(SAVE, registration);
  },
  /**
   * Removes the registration details from the local store and state by wiping out all present information about it.
   *
   * @param {Function} commit - State commit function
   * @param {Function} dispatch - Action dispatcher
   * @return {Promise<void>} Void
   */
  async remove({ commit, dispatch }) {
    const state = await driver.storage.local.get();
    const { registration } = state;
    // Create new user id
    registration.userId = uuidv4();
    // Set the uninstall url which should be opened when the extension is uninstalled
    if (registration.userId && registration.vendor) {
      driver.runtime
        .setUninstallURL(`${IAM_PANEL_EXCHANGE_URL}/home/registration?action=remove&userId=${registration.userId}&vendor=${registration.vendor}`);
    }
    // Wipe panel identifier
    registration.panelId = undefined;
    // Wipe vendor name
    registration.vendor = undefined;
    registration.updatedAt = new Date().toJSON();
    const newState = {
      ...state,
      registration,
    };
    await driver.storage.local.set(newState);
    // Deactivate tracking when panel and vendor identifier are set
    dispatch('settings/save', { tracking: false }, { root: true });
    commit(SAVE, registration);
  },
};

const mutations = {
  [SAVE](state, registration) {
    state.registration = registration;
  },
};

const getters = {
  getRegistration: state => state.registration,
  isRegistered: state => state.registration.panelId && state.registration.vendor,
};

export default {
  actions,
  getters,
  mutations,
  namespaced: true,
  state: defaultState,
};
