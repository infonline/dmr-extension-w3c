import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

/**
 * Detects if current browser language is german and returns english locale by default.
 *
 * @return {Object} Language options
 */
const getLocale = () => {
  let lang = browser.i18n.getUILanguage();
  if (lang.includes('-')) {
    [lang] = lang.split('-');
  }
  return lang === 'de' ? {
    locale: 'de',
    fallbackLocale: 'en',
  } : {
    locale: 'en',
    fallbackLocale: 'en',
  };
};

export default new VueI18n(getLocale());
