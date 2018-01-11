/**
 * This module contains edge related build methods. These methods are necessary because of the store
 * publishing rules described on https://docs.microsoft.com/en-us/microsoft-edge/extensions/guides/packaging/localizing-extension-packages
 */
const fs = require('fs');
const path = require('path');
/**
 * Mapping of permission keys to edge appx manifest capabilities
 *
 * @type {Object}
 */
const EDGE_CAPABILITIES_MAP = {
  '<any url>': 'websiteContent',
  '<all_urls>': 'websiteContent',
  cookies: 'websiteCookies',
  geolocation: 'geolocation',
  storage: 'browserStorage',
  tabs: 'websiteInfo',
  webNavigation: 'websiteInfo',
  webRequest: 'browserWebRequest',
};
const MANIFEST_MSG_KEY = '__MSG_';
const SUPPORTED_I18N_CODES = JSON.parse(fs.readFileSync(path
  .resolve(__dirname, '../assets/shared/supportedI18nCodes.json')).toString());
/**
 * Gets the extension manifest and convert it to built in object literal
 *
 * @returns {Object}
 */
const getExtensionManifest = () => JSON.parse(fs.readFileSync(path
  .resolve(__dirname, '../../src/manifest.json')).toString());
/**
 * Extracts the permissions from the manifest file and will map them to the edge capabilities (XML).
 *
 * @param {Object} manifest - The manifest file of the edge web extension
 * @param {Array} manifest.permissions - The permissions collection of the web extension manifest
 * @return {String} XML capability collection as string
 */
const extractCapabilities = (manifest) => {
  const capabilities = {};
  // Map extension permissions to app capabilities
  for (let i = 0, iLen = manifest.permissions.length; i < iLen; i += 1) {
    const element = manifest.permissions[i];
    const mapKeys = Object.keys(EDGE_CAPABILITIES_MAP);
    if (mapKeys.includes(element)) {
      const mappedElement = EDGE_CAPABILITIES_MAP[element];
      capabilities[mappedElement] = true;
    }
    if (element.includes('://')) {
      capabilities.websiteContent = true;
    }
  }
  // Build capabilities xml
  const capKeys = Object.keys(capabilities);
  let capString = '';
  for (let i = 0, iLen = capKeys.length; i < iLen; i += 1) {
    const key = capKeys[i];
    capString += `<Capability Name="${key}"/>`;
    if (i < iLen - 1) {
      // Add correct test indentations
      capString += '\r\n\t\t\t\t\t\t\t\t';
    }
  }
  return capString;
};
/**
 * Retrieves the supported locales from the _locales folder in the src folder. These will
 * be needed to build the resource entries for a localized AppxManifest.xml
 *
 * @returns {[String]}
 */
const getExtensionLocalesList = () => {
  // Resolve _locales directory
  const localesPath = path.resolve(__dirname, '../../', 'src/_locales');
  // Return a collection of i18n keys which are a image of the folder structure hosted under
  // _locales in the source folder. Because we cannot guarantee that all objects are directories we
  // have to check this and filter them out
  return fs.readdirSync(localesPath)
    .filter(folder => fs.statSync(path
      .resolve(__dirname, '../../', 'src/_locales', folder)).isDirectory());
};
/**
 * Extracts the version from web extension manifest and will pad it with 0's on the left if it
 * does not have 4 segments
 *
 * @param {Object} manifest - The manifest file of the edge web extension
 * @param {String} manifest.version - The version property of the  of the edge web extension
 *        manifest
 *
 * @return {String} Padded web extension version
 */
const extractExtensionVersion = (manifest) => {
  const versionParts = manifest.version.split('.');
  while (versionParts.length < 4) {
    versionParts.push('0');
  }
  return versionParts.slice(0, 4).join('.');
};
/**
 * Checks if current manifest includes localisation support keys and there for needs to be localized
 *
 * @param {Object} manifest - The parsed content of the extension manifest.json from source folder
 * @returns {Boolean} Check result
 */
const shouldLocalize = (manifest) => {
  let localizeResource = false;
  if (!Object.keys(manifest).includes('default_locale')) {
    return false;
  }

  if (manifest.name.includes(MANIFEST_MSG_KEY)) {
    localizeResource = true;
  }
  if (manifest.name.includes(MANIFEST_MSG_KEY)) {
    localizeResource = true;
  }
  return localizeResource;
};
/**
 * Maps the i18n keys to the microsoft store notation
 *
 * @param {String} locale - The i18n code
 * @returns {String|undefined}
 */
const mapLocalesFromI18nToUWP = (locale) => {
  const normalizedLocale = locale.toLowerCase();
  let result;
  if (SUPPORTED_I18N_CODES.includes(locale)) {
    result = normalizedLocale;
  } else if (normalizedLocale.includes('_')) {
    const underscoreToHyphenLocale = locale.replace('_', '-');
    if (SUPPORTED_I18N_CODES.includes(underscoreToHyphenLocale)) {
      result = underscoreToHyphenLocale;
    }
  }
  return result;
};
/**
 *
 * @param {Object} manifest
 * @param {Array} extensionLocalesList
 */
const getI18nResources = (manifest, extensionLocalesList) => {
  const resourceKey = '{LanguageCode}';
  const resourceTemplate = `<Resource Language="${resourceKey}" />`;
  let resourceString = '';
  // Check if manifest needs to be localised
  if (shouldLocalize(manifest)) {
    const defaultLocale = mapLocalesFromI18nToUWP(manifest.default_locale);
    if (!defaultLocale) {
      throw new Error('Default Locale cannot be mapped to a Microsoft store locale.');
    }
    // Create resource string for default locale
    resourceString = resourceTemplate.replace(resourceKey, defaultLocale);
    // Create resource strings for the other languages
    for (let i = 0, iLen = extensionLocalesList.length; i < iLen; i += 1) {
      const currentLocale = mapLocalesFromI18nToUWP(extensionLocalesList[i]);
      if (currentLocale && currentLocale !== defaultLocale) {
        // Add text control characters
        resourceString += '\r\n\t\t';
        // Add additional resource string
        resourceString += resourceTemplate.replace(resourceKey, currentLocale);
      }
    }
  } else {
    // Add default language
    resourceString = resourceTemplate.replace(resourceKey, 'en-us');
  }
  // Add last element
  resourceString += '\r\n\t\t<Resource uap:Scale="200"/>';
  return resourceString;
};
/**
 * Localizes the appxManifest.xml contents
 *
 * @param {Object} manifest - The parsed extension manifest from source folder
 * @param {String} content - The AppxManifest.xml file content
 * @return {String} Processed AppxManifest.xml content
 */
const localizeAppxManifest = (manifest, content) => {
  try {
    // Create a copy of the provided content
    let replacedContent = content;
    // Determine the supported languages
    const extensionLocalesList = getExtensionLocalesList();
    // Replace placeholder in AppxManifest.xml with i18n placeholders when the specific manifest
    // keys are localized
    if (manifest.name.includes(MANIFEST_MSG_KEY)) {
      replacedContent = replacedContent.replace(/{DisplayName}/g, 'ms-resource:DisplayName');
    }
    if (manifest.description.includes(MANIFEST_MSG_KEY)) {
      replacedContent = replacedContent.replace(/{Description}/g, 'ms-resource:Description');
    }
    // Create i18n resources collection and replace the specific placeholder with them
    const resources = getI18nResources(manifest, extensionLocalesList);
    return replacedContent.replace(/{Resources}/g, resources);
  } catch (err) {
    throw err;
  }
};
/**
 * Replaces the edge manifest values in the appx template with the specific
 * values from the web extension manifest file.
 *
 * @param {Buffer} file - The appxManifest.xml buffer
 * @return {Buffer} - The replaced contents of the appxManifest.xml as buffer
 */
const replaceEdgeManifestValues = (file) => {
  try {
    const manifest = getExtensionManifest();
    if (manifest) {
      const content = localizeAppxManifest(manifest, file.toString());
      const capabilities = extractCapabilities(manifest);
      const version = extractExtensionVersion(manifest);
      const replacedContent = content
        .replace(/{DisplayName}/g, manifest.name)
        .replace(/{Version}/g, version)
        .replace(/{Description}/g, manifest.description)
        .replace(/{Capabilities}/g, capabilities);
      return Buffer.from(replacedContent);
    }
    throw new Error(`Cannot locate manifest.json in ${path
      .resolve(__dirname, '../../src/manifest.json')}!`);
  } catch (err) {
    throw err;
  }
};
/**
 * Converts the locale message content stored in the extension's _locales folder to a microsoft
 * store compatible resource.
 *
 * @param {Buffer} file - The locales message from the _locales folder
 * @returns {Buffer} The converted locales message as buffer
 */
const convertExtensionLocalesToResourceObjects = (file) => {
  try {
    const manifest = getExtensionManifest();
    if (manifest && shouldLocalize(manifest)) {
      const content = file.toString();
      const results = {};
      // Remove BOM from locale message content and convert it to built in object literal
      const contentObject = JSON.parse(content.replace('\ufeff', '').replace('\uffef', ''));
      // Begin extraction of localized extension name
      if (manifest.name.includes(MANIFEST_MSG_KEY)) {
        let nameKey = manifest.name.replace(MANIFEST_MSG_KEY, '');
        nameKey = nameKey.substring(0, nameKey.length - 2);
        if (contentObject[nameKey] && contentObject[nameKey].message
          && contentObject[nameKey].message.length > 0) {
          results.DisplayName = contentObject[nameKey].message;
          results['_DisplayName.comment'] = contentObject[nameKey].description || '';
        }
      }
      // Begin extraction of localized extension description
      if (manifest.description.includes(MANIFEST_MSG_KEY)) {
        let descriptionKey = manifest.description.replace(MANIFEST_MSG_KEY, '');
        descriptionKey = descriptionKey.substring(0, descriptionKey.length - 2);
        if (contentObject[descriptionKey] && contentObject[descriptionKey].message
          && contentObject[descriptionKey].message.length > 0) {
          results.Description = contentObject[descriptionKey].message;
          results['_Description.comment'] = contentObject[descriptionKey].description || '';
        }
      }
      const resultJSON = JSON.stringify(results);
      return Buffer.from(resultJSON);
    }
    return Buffer.from('');
  } catch (err) {
    throw err;
  }
};

exports.replaceEdgeManifestValues = replaceEdgeManifestValues;
exports.convertExtensionLocalesToResourceObjects = convertExtensionLocalesToResourceObjects;
