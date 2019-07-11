/* globals DMR_WEB_APP_URL, ENV */
import * as licenses from '../assets/licenses.json';

export const DMR_WEB_APP_URIS = [
  'dmr.infonline.de',
  'digitalmarketresearch.de',
  'digitalmarketresearch.eu',
  'digitalmarketresearch.info',
  'digitalmarketresearch.at',
];
export const DEFAULT_DMR_WEB_APP_URL = DMR_WEB_APP_URL;
export const ENVIRONMENT = ENV;
/**
 * The default URL filter for navigation events
 *
 * @type {{url: *[]}}
 */
export const URL_FILTER = {
  url: [{
    // Listen only for http and https schemes
    schemes: ['http', 'https'],
  }],
};
export const MESSAGE_DIRECTIONS = {
  WEB_APP: 'DMR_WEB_APP',
  EXTENSION: 'DMR_EXTENSION',
};
export const MESSAGE_ACTIONS = {
  ACTIVATE_TRACKING: 'ACTIVATE_TRACKING',
  COMPLETE_REGISTRATION: 'COMPLETE_REGISTRATION',
  COUNT: 'COUNT',
  DEACTIVATE_TRACKING: 'DEACTIVATE_TRACKING',
  GET_EXTENSION_STATS: 'GET_EXTENSION_STATS',
  GET_REGISTRATION: 'GET_REGISTRATION',
  GET_SETTINGS: 'GET_SETTINGS',
  OPEN_EXTENSION_TAB: 'OPEN_EXTENSION_TAB',
  REMOVE_PROVIDER: 'REMOVE_PROVIDER',
  REMOVE_REGISTRATION: 'REMOVE_REGISTRATION',
  SET_PANEL_ID: 'SET_PANEL_ID',
  SET_PROVIDER: 'SET_PROVIDER',
  TOGGLE_AGREEMENT: 'TOGGLE_AGREEMENT',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
};

export const LICENSES = licenses;
