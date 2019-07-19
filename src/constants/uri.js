/* globals DMR_WEB_APP_URL */
export const DMR_WEB_APP_URIS = [
  'dmr.infonline.de',
  'digitalmarketresearch.de',
  'digitalmarketresearch.eu',
  'digitalmarketresearch.info',
  'digitalmarketresearch.at',
];
export const DEFAULT_DMR_WEB_APP_URL = DMR_WEB_APP_URL;
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
