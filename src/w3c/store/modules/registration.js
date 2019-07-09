/* eslint-disable no-param-reassign */
/* globals IAM_PANEL_EXCHANGE_URL */
import { driver } from '../../scripts/driver';
import { uuidv4 } from '../../scripts/utils';

const SAVE = 'SAVE';

const defaultState = () => ({
  registration: {
    installationId: undefined,
    userId: undefined,
    panelId: undefined,
    provider: {
      id: undefined,
      name: undefined,
      label: undefined,
    },
    agreed: false,
    completed: false,
    createdAt: new Date().toJSON(),
    updatedAt: undefined,
  },
});

/**
 * Sets the uninstall URL for the current extension
 *
 * @param {String} userId - User identifier
 * @param {String} provider - Name of the provider
 */
const setUninstallUrl = (userId, provider) => {
  driver.runtime.setUninstallURL(`${IAM_PANEL_EXCHANGE_URL}/remove?&userId=${encodeURIComponent(userId)}&provider=${encodeURIComponent(provider)}`);
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
        ...defaultState().registration,
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
        url: `${IAM_PANEL_EXCHANGE_URL}/registration/wizard`,
      });
    }
    // Set the uninstall url which should be opened when the extension is uninstalled
    if (registration.userId && registration.provider) {
      setUninstallUrl(registration.userId, registration.provider.name);
    }
    // Commit state mutation
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
  isRegistered: state => state.registration.userId && state.registration.provider,
  isConfirmed: state => state.registration.panelId && state.registration.provider && state.registration.userId,
};

export default {
  actions,
  getters,
  mutations,
  namespaced: true,
  state: defaultState(),
};
