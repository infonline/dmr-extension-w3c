/* eslint-disable no-param-reassign */
import { uuidv4, setUninstallUrl } from '../../common/utils';
import { DEFAULT_DMR_WEB_APP_URL } from '../../constants';

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

const actions = {
  /**
   * Initializes the registration module
   *
   * @param {Function} commit - Commits mutations to the state triggered by the action
   * @param {Function} dispatch - Dispatches local actions or actions from other modules
   * @returns {Promise<void>} Void
   */
  async init({ commit, dispatch }) {
    const state = await browser.storage.local.get();
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
      await browser.storage.local.set(newState);
      dispatch('settings/save', { tracking: false }, { root: true });
      // Create a new tab with the DMR registration site url
      browser.tabs.create({
        url: `${DEFAULT_DMR_WEB_APP_URL}/registration/wizard`,
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
