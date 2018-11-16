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
   * @returns {Promise<void>}
   */
  async init({ commit }) {
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
      // Create a new tab with the IMAREX registration site url
      driver.tabs.create({
        url: `${IAM_PANEL_EXCHANGE_URL}/user/registration`,
      });
    }
    // Commit state mutation
    commit(SAVE, registration);
  },
  async save({ commit }, data) {
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
    await driver.storage.local.set(newState);
    commit(SAVE, registration);
  },
  async remove({ commit }) {
    const state = await driver.storage.local.get();
    const { registration } = state;
    registration.panelId = undefined;
    registration.vendor = undefined;
    registration.updatedAt = new Date().toJSON();
    const newState = {
      ...state,
      registration,
    };
    await driver.storage.local.set(newState);
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
