import { driver } from '../../scripts/driver';
// Constants
const ROUTE_CHANGED = 'ROUTE_CHANGED';
/**
 * Clones the given route
 *
 * @param {Object} to - Transition target
 * @param {Object} [from] - Optional transition source
 * @return {Object} Cloned route transition
 */
const cloneRoute = (to, from) => {
  const clone = {
    name: to.name,
    path: to.path,
    hash: to.hash,
    query: to.query,
    params: to.params,
    fullPath: to.fullPath,
    meta: to.meta,
  };
  if (from) {
    clone.from = cloneRoute(from);
  }
  return clone;
};

// Module actions
const actions = {
  /**
   * Loads the last route from the local storage and checks if the last route stored equals the current route. If not the provided router will be
   * instructed to transit to last route. The expected behavior is that the last view is saved and called again.
   *
   * @param {Array} args - Load arguments
   * @return {Promise<void>} Void
   */
  async load(...args) {
    const [, router] = args;
    const localStore = await driver.storage.local.get();
    if (router.currentRoute.path !== localStore.lastRoute.path) {
      router.push(localStore.lastRoute.path);
    }
  },
  /**
   * Saves the current route to local store and will commit the mutation to the current module state. When action is dispatched the route will saved
   * persistent to local store.
   *
   * @param {Function} commit - State commit function
   * @param {Object} transition - The route transition
   * @return {Promise<void>} Void
   */
  async save({ commit }, transition) {
    const localStore = await driver.storage.local.get();
    const route = cloneRoute(transition.to, transition.from);
    localStore.lastRoute = route;
    await driver.storage.local.set(localStore);
    commit(ROUTE_CHANGED, route);
  },
};

const mutations = {
  [ROUTE_CHANGED](state, route) {
    // eslint-disable-next-line no-param-reassign
    state.route = route;
  },
};
/**
 * Syncs all mutations made by the routing to the vuex module
 *
 * @param {Object} store - Vuex store instance
 * @param {Object} router - Vue router instance
 * @return {unSync} Function to un sync the store
 */
export default function sync(store, router) {
  store.registerModule('route', {
    namespaced: true,
    actions,
    mutations,
    state: cloneRoute(router.currentRoute),
  });

  let isTimeTraveling = false;
  let currentPath;

  // sync router on store change
  const removeWatch = store.watch(
    state => state.route,
    (route) => {
      const { fullPath } = route;
      if (fullPath === currentPath) {
        return;
      }
      if (currentPath !== null) {
        isTimeTraveling = true;
        router.push(route);
      }
      currentPath = fullPath;
    },
    { sync: true },
  );

  // sync store on router navigation
  const removeAfterEachHook = router.afterEach((to, from) => {
    if (isTimeTraveling) {
      isTimeTraveling = false;
      return;
    }
    currentPath = to.fullPath;
    store.dispatch('route/save', { to, from });
  });

  /**
   * Removes synchronisation and cleans up hooks and watcher
   */
  return function unsync() {
    // On unsync, remove router hook
    if (removeAfterEachHook !== null) {
      removeAfterEachHook();
    }

    // On unsync, remove store watch
    if (removeWatch !== null) {
      removeWatch();
    }
    // On unsync, unregister Module with store
    store.unregisterModule('route');
  };
}
