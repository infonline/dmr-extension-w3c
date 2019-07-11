/* env browser */
// eslint-disable-next-line no-unused-vars
let szmvars = '';
const dummySite = 'dummy';
const baseUrlDE = 'de.ioam.de/tx.io';
const baseUrlLSO = 'de.ioam.de/aid.io';
const optinUrl = 'de.ioam.de/optin.php?re=';
const qdsUrl = 'irqs.ioam.de';
const deBaseUrl = '.ioam.de/tx.io';
const deBaseUrlLSO = '.ioam.de/aid.io';
// Todo: Variable is not used in code and should be removed
// eslint-disable-next-line no-unused-vars
const deOptinUrl = '.ioam.de/optin.php?re=';
const deSubdomain = ['imarex'];
const cntBaseUrl = '.iocnt.net/tx.io';
const cntBaseUrlLSO = '.iocnt.net/aid.io';
// Todo: Variable is not used in code and should be removed
// eslint-disable-next-line no-unused-vars
const cntOptinUrl = '.iocnt.net/optin.php?re=';
const cntQdsUrl = 'irqs.iocnt.net';
const cntSubdomain = ['at'];
const eventList = [
  '',
  'inst',
  'init',
  'open',
  'clse',
  'play',
  'resm',
  'stop',
  'fowa',
  'bakw',
  'recd',
  'paus',
  'forg',
  'bakg',
  'dele',
  'refr',
  'kill',
  'view',
  'alve',
  'fini',
  'mute',
  'aforg',
  'abakg',
  'aclse',
  'sple',
  'scvl',
  'serr',
  'spyr',
  'smdr',
  'sfpl',
  'sfqt',
  'ssqt',
  'stqt',
  'soqt',
  'sofc',
  'scfc',
  'scqt',
  'splr',
  'spli',
  'sprs',
  'spre',
  'smrs',
  'smre',
  'sors',
  'sore',
  'sack',
  'sapl',
  'sapa',
  'snsp',
];
const LSOBlacklist = [];
const checkEvents = 1;
const tb = 0;
const sv = 1;
let lastEvent = '';
const emptyCode = 'Leercode_nichtzuordnungsfaehig';
const autoEvents = {
  onfocus: 'aforg',
  onblur: 'abakg',
  onclose: 'aclse',
};
const nt = 2;
const cookiewhitelist = [];
const cookieName = 'ioam2018';
let cookieMaxRuns = 0;
const socioToken = 'private';
let frequency = 60000;
const hbiAdShort = 5000;
const hbiAdMedium = 10000;
const hbiAdLong = 30000;
const hbiShort = 10000;
const hbiMedium = 30000;
const hbiLong = 60000;
const hbiExtraLong = 300000;
let heart;
let IAMPageElement = null;
let IAMQSElement = null;
let qdsParameter = {};
const qdsPopupBlockDuration = 86400000;
let result = {};
let mode;
let eventsEnabled = 0;
let surveyCalled = 0;
let inited = 0;
const lsottl = 86400000;
const lsottlmin = 180000;
const ioplusurl = 'me.ioam.de';
/**
 * Enables auto events
 */
function enableEvents() {
  if ((tb === 1 || result.tb === 'on') && result.tb !== 'off' && !eventsEnabled) {
    eventsEnabled = 1;
    mode = 1;
    Object.keys(autoEvents).forEach((e) => {
      const oldEvent = window[e];
      window[e] = function listener() {
        if (lastEvent !== autoEvents[e]) {
          lastEvent = autoEvents[e];
          // eslint-disable-next-line no-use-before-define
          event(autoEvents[e]);
        }
        if (typeof oldEvent === 'function') oldEvent();
      };
    });
  }
}
/**
 * Checks if do not track is activated in current browser
 *
 * @return {Boolean} Check result
 */
function isDoNotTrack() {
  // eslint-disable-next-line no-bitwise,no-nested-ternary
  if ((nt & 2) ? ((typeof result.nt === 'undefined') ? (nt & 1) : result.nt) : nt & 1) {
    if (window.navigator.msDoNotTrack && window.navigator.msDoNotTrack === '1') return true;
    if (window.navigator.doNotTrack && (window.navigator.doNotTrack === 'yes' || window.navigator.doNotTrack === '1')) return true;
  }
  return false;
}

/**
 * Loads the QDS invitation script
 *
 * @param {Object} response - QDS response
 */
function getInvitation(response) {
  if (response && Object.keys(response).includes('block-status')) {
    const isEligibleForInvitation = (response['block-status'].toUpperCase() === 'NONE');
    if (isEligibleForInvitation) {
      if (IAMQSElement) {
        IAMQSElement.parentNode.removeChild(IAMQSElement);
      }
      // eslint-disable-next-line no-use-before-define
      IAMQSElement = createScriptTag(response['invite-url']);
    }
  }
}

/**
 * Loads the QDS survey element
 */
function loadSurvey() {
  szmvars = `${result.st}//${result.pt}//${result.cp}//VIA_SZMNG`;
  let sampleType = (result.sv === 'i2') ? 'in' : result.sv;
  let qdsHost = qdsUrl;
  if (result.cn) {
    sampleType += `_${result.cn}`;
    if (result.cn === 'at') {
      qdsHost = cntQdsUrl;
    }
  }
  qdsParameter = {
    siteIdentifier: result.cp,
    offerIdentifier: result.st,
    sampleType,
    pixelType: result.pt,
    contentType: result.cp,
    host: qdsHost,
    port: '',
    isFadeoutFlash: true,
    isFadeoutFrame: true,
    isFadeoutForm: true,
    positionTop: 10,
    positionLeft: 100,
    zIndex: 1100000,
    popupBlockDuration: qdsPopupBlockDuration,
    keysForQueryParam: [
      'offerIdentifier',
      'siteIdentifier',
      'sampleType',
      'pixelType',
      'isFadeoutFlash',
      'isFadeoutFrame',
      'isFadeoutForm',
      'positionTop',
      'positionLeft',
      'zIndex'],
  };
  if (typeof window.iam_zindex !== 'undefined') {
    qdsParameter.zIndex = window.iam_zindex;
  }
  if (typeof window.iam_fadeout_flash !== 'undefined') {
    qdsParameter.isFadeoutFlash = window.iam_fadeout_flash;
  }
  if (typeof window.iam_fadeout_iframe !== 'undefined') {
    qdsParameter.isFadeoutFrame = window.iam_fadeout_iframe;
  }
  if (typeof window.iam_fadeout_form !== 'undefined') {
    qdsParameter.isFadeoutForm = window.iam_fadeout_form;
  }
  if (typeof window.iam_position_top !== 'undefined') {
    qdsParameter.positionTop = window.iam_position_top;
  }
  if (typeof window.iam_position_left !== 'undefined') {
    qdsParameter.positionLeft = window.iam_position_left;
  }
  const filterObjectByKeys = (obj, keysToFilter) => {
    const filterResult = {};
    let key;
    const arrayLength = keysToFilter.length;
    for (let i = 0; i < arrayLength; i += 1) {
      key = keysToFilter[i];
      if (Object.keys(obj).includes(key)) {
        filterResult[key] = obj[key];
      }
    }
    return filterResult;
  };
  const serializeToQueryString = (obj) => {
    const str = [];
    Object.keys(obj).forEach((key) => {
      str.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
    });
    return str.join('&');
  };
  const createPopupcheckCookie = (blockDuration) => {
    const blockedUntilDate = new Date();
    blockedUntilDate.setTime(blockedUntilDate.getTime() + blockDuration);
    const expires = `expires=${blockedUntilDate.toUTCString()}`;
    document.cookie = `POPUPCHECK=${blockedUntilDate.getTime().toString()};${expires};path=/`;
  };
  const hasPopupcheckCookie = () => {
    const cookie = document.cookie.split(';');
    for (let i = 0, iLen = cookie.length; i < iLen; i += 1) {
      if (cookie[i].match('POPUPCHECK=.*')) {
        const currentDate = new Date();
        const now = currentDate.getTime();
        currentDate.setTime(cookie[i].split('=')[1]);
        const blockedUntilTime = currentDate.getTime();
        if (now <= blockedUntilTime) {
          return true;
        }
      }
    }
    return false;
  };
  if (hasPopupcheckCookie()) {
    return;
  }
  if (sv && !surveyCalled && result.sv !== 'ke' && result.sv === 'dz') {
    surveyCalled = 1;
    // eslint-disable-next-line no-undef
    iam_ng_nxss();
  }
  if (sv && !surveyCalled && result.sv !== 'ke' && (result.sv === 'in' || result.sv === 'mo' || result.sv === 'i2')) {
    surveyCalled = 1;
    createPopupcheckCookie(qdsParameter.popupBlockDuration);
    const { protocol } = window.location;
    const pathOfCheckInvitation = 'identitystatus';
    const queryParameter = filterObjectByKeys(qdsParameter, qdsParameter.keysForQueryParam);
    const queryParameterString = `?${serializeToQueryString(queryParameter)}`;
    let checkForInvitationUrl;
    if (window.XDomainRequest && document.documentMode === 9) {
      // eslint-disable-next-line max-len
      checkForInvitationUrl = `${protocol}//${qdsParameter.host}/${pathOfCheckInvitation}/identity.js${queryParameterString}&callback=iom.gi&c=${Math.random()}`;
      // eslint-disable-next-line no-use-before-define
      createScriptTag(checkForInvitationUrl);
    } else {
      checkForInvitationUrl = `${protocol}//${qdsParameter.host}/${pathOfCheckInvitation}${queryParameterString}&c=${Math.random()}`;
      const httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function readyStateChange() {
        if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
          const response = JSON.parse(httpRequest.responseText);
          getInvitation(response);
        }
      };
      httpRequest.open('GET', checkForInvitationUrl, true);
      httpRequest.withCredentials = true;
      httpRequest.send(null);
    }
  }
}

/**
 * Simple hash function
 *
 * @param {String} key - Key to hash
 * @return {String} - Hash result
 */
function hash(key) {
  let hashResult = 0;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < key.length; ++i) {
    hashResult += key.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hashResult += (hashResult << 10);
    // eslint-disable-next-line no-bitwise
    hashResult ^= (hashResult >> 6);
  }
  // eslint-disable-next-line no-bitwise
  hashResult += (hashResult << 3);
  // eslint-disable-next-line no-bitwise
  hashResult ^= (hashResult >> 11);
  // eslint-disable-next-line no-bitwise
  hashResult += (hashResult << 15);
  // eslint-disable-next-line no-bitwise
  hashResult = Math.abs(hashResult & hashResult);
  return hashResult.toString(36);
}

function activeXDetect() {
  let detectionResult = '';
  let componentVersion;
  const components = [
    '7790769C-0471-11D2-AF11-00C04FA35D02', '89820200-ECBD-11CF-8B85-00AA005B4340',
    '283807B5-2C60-11D0-A31D-00AA00B92C03', '4F216970-C90C-11D1-B5C7-0000F8051515',
    '44BBA848-CC51-11CF-AAFA-00AA00B6015C', '9381D8F2-0288-11D0-9501-00AA00B911A5',
    '4F216970-C90C-11D1-B5C7-0000F8051515', '5A8D6EE0-3E18-11D0-821E-444553540000',
    '89820200-ECBD-11CF-8B85-00AA005B4383', '08B0E5C0-4FCB-11CF-AAA5-00401C608555',
    '45EA75A0-A269-11D1-B5BF-0000F8051515', 'DE5AED00-A4BF-11D1-9948-00C04F98BBC9',
    '22D6F312-B0F6-11D0-94AB-0080C74C7E95', '44BBA842-CC51-11CF-AAFA-00AA00B6015B',
    '3AF36230-A269-11D1-B5BF-0000F8051515', '44BBA840-CC51-11CF-AAFA-00AA00B6015C',
    'CC2A9BA0-3BDD-11D0-821E-444553540000', '08B0E5C0-4FCB-11CF-AAA5-00401C608500',
    'D27CDB6E-AE6D-11CF-96B8-444553540000', '2A202491-F00D-11CF-87CC-0020AFEECF20',
  ];
  document.body.addBehavior('#default#clientCaps');
  for (let i = 0; i < components.length; i += 1) {
    componentVersion = document.body.getComponentVersion(`{${components[i]}}`, 'ComponentID');
    if (componentVersion !== null) {
      detectionResult += componentVersion;
    } else {
      detectionResult += 'null';
    }
  }
  return detectionResult;
}

function fingerprint() {
  const nav = window.navigator;
  let t = nav.userAgent;
  // eslint-disable-next-line no-use-before-define
  t += getScreen();
  if (nav.plugins.length > 0) {
    for (let i = 0; i < nav.plugins.length; i += 1) {
      t += nav.plugins[i].filename + nav.plugins[i].version + nav.plugins[i].description;
    }
  }
  if (nav.mimeTypes.length > 0) {
    for (let i = 0; i < nav.mimeTypes.length; i += 1) {
      t += nav.mimeTypes[i].type;
    }
  }
  if (/MSIE (\d+\.\d+);/.test(nav.userAgent)) {
    try {
      t += activeXDetect();
    } catch (e) {
      // ignore
    }
  }
  return hash(t);
}

function createScriptTag(url) {
  const el = document.createElement('script');
  el.type = 'text/javascript';
  el.src = url;
  const head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(el);
    return el;
  }
  return false;
}

// Todo: Is not used in code. Should be removed
// eslint-disable-next-line no-unused-vars
function createScriptTagAsync(url, cb) {
  const el = document.createElement('script');
  el.type = 'text/javascript';
  el.src = url;
  el.onload = cb;
  el.async = true;
  const head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(el);
    return el;
  }
  return false;
}

function transmitData(url, transmissionMode) {
  if (url.split('/')[2].slice(url.split('/')[2].length - 8) === '.ioam.de'
    || url.split('/')[2].slice(url.split('/')[2].length - 10) === '.iocnt.net') {
    let IAMsendBox;
    let sendBoxStyle;
    switch (transmissionMode) {
      case 1:
        if (IAMPageElement) {
          IAMPageElement.parentNode.removeChild(IAMPageElement);
        }
        IAMPageElement = createScriptTag(`${url}&mo=1`);
        if (!IAMPageElement) (new Image()).src = `${url}&mo=0`;
        break;
      case 2:
        (new Image()).src = `${url}&mo=0`;
        break;
      case 3:
        IAMsendBox = document.getElementById('iamsendbox');
        if (IAMsendBox) {
          document.body.removeChild(IAMsendBox);
        }
        IAMsendBox = document.createElement('iframe');
        IAMsendBox.id = 'iamsendbox';
        sendBoxStyle = IAMsendBox.style;
        sendBoxStyle.position = 'absolute';
        sendBoxStyle.left = '-999px';
        sendBoxStyle.top = '-999px';
        IAMsendBox.src = `${url}&mo=1`;
        document.body.appendChild(IAMsendBox);
        break;
      case 0:
      default:
        document.write(`<script src="${url}&mo=1"></script>`);
    }
  }
}

function getScreen() {
  return `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
}

function arrayContains(arr, obj) {
  let i;
  for (i = 0; i < arr.length; i += 1) {
    if (arr[i] === obj) return true;
  }
  return false;
}

function transformVar(value) {
  let transformResult = value.replace(/[?#].*/g, '').replace(/[^a-zA-Z0-9,_/-]+/g, '.');
  if (transformResult.length > 255) {
    transformResult = `${transformResult.substr(0, 254)}+`;
  }
  return transformResult;
}

function transformRef(value) {
  let transformResult = value.replace(/[^a-zA-Z0-9,_/:-]+/g, '.');
  if (transformResult.length > 255) {
    transformResult = `${value.substr(0, 254)}+`;
  }
  return transformResult;
}


function getRefHost() {
  const url = document.referrer.split('/');
  return (url.length >= 3) ? url[2] : '';
}

function buildResult(params) {
  result = {};
  // Map all parameters over to result dictionary
  Object.keys(params).forEach((param) => {
    // eslint-disable-next-line no-mixed-operators
    if (param === 'cn' && (arrayContains(deSubdomain, params[param])) || (arrayContains(cntSubdomain, params[param]))) {
      // Check cn (country) parameter against cnt or de sub domain collection
      result[param] = params[param];
    } else {
      result[param] = params[param];
    }
  });
  const resultKeys = Object.keys(result);
  if (resultKeys.includes('fp')) {
    result.fp = (result.fp !== '' && typeof result.fp !== 'undefined') ? result.fp : emptyCode;
    result.fp = transformVar(result.fp);
    result.pt = 'FP';
  }
  if (resultKeys.includes('np')) {
    result.np = (result.np !== '' && typeof result.np !== 'undefined') ? result.np : emptyCode;
    result.np = transformVar(result.np);
    result.pt = 'NP';
  }
  if (resultKeys.includes('xp')) {
    result.xp = (result.xp !== '' && typeof result.xp !== 'undefined') ? result.xp : emptyCode;
    result.xp = transformVar(result.xp);
    result.pt = 'XP';
  }
  if (resultKeys.includes('cp')) {
    result.cp = (result.cp !== '' && typeof result.cp !== 'undefined') ? result.cp : emptyCode;
    result.cp = transformVar(result.cp);
    result.pt = 'CP';
  }
  if (!result.pt) {
    result.cp = emptyCode;
    result.pt = 'CP';
    result.er = 'N13';
  }
  if (resultKeys.includes('ps')) {
    result.ps = 'lin';
    result.er = 'N22';
  } else if (!(arrayContains(['ack', 'lin', 'pio', 'out'], result.ps))) {
    result.ps = 'lin';
    result.er = 'N23';
  }
  result.rf = getRefHost();
  if (!resultKeys.includes('sur') || (resultKeys.includes('sur') && result.sur !== 'yes')) {
    result.r2 = transformRef(document.referrer);
  }
  result.ur = document.location.host;
  result.xy = getScreen();
  result.cb = '9999';
  result.vr = '414';
  result.id = fingerprint();
  result.st = result.st ? result.st : dummySite;
  if (!resultKeys.includes('sc') || (resultKeys.includes('sc') && result.sc !== 'no')) {
    // eslint-disable-next-line no-use-before-define
    const cookie = getFirstPartyCookie();
    result.i3 = cookie.cookie;
    result.n1 = cookie.length;
  }
  if (((arrayContains(cookiewhitelist, result.st)) || (resultKeys.includes('sc') && result.sc === 'yes')) && result.i3 === 'nocookie') {
    // eslint-disable-next-line no-use-before-define
    result.i3 = setFirstPartyCookie();
  }
  if (!resultKeys.includes('cn') && result.st.charAt(2) === '_') {
    const cn = result.st.substr(0, 2);
    if (arrayContains(deSubdomain, cn) || arrayContains(cntSubdomain, cn)) {
      result.cn = cn;
    } else {
      result.er = 'E12';
    }
  }
  // DNT dissemination survey
  try {
    result.dntt = ((window.navigator.msDoNotTrack && window.navigator.msDoNotTrack === '1')
      || (window.navigator.doNotTrack && (window.navigator.doNotTrack === 'yes' || window.navigator.doNotTrack === '1'))) ? '1' : '0';
  } catch (e) {
    // ignore
  }
}

function event(transmittedEvent = '') {
  let payLoad = '';
  // eslint-disable-next-line no-use-before-define
  stopHeart();
  if (inited && !isDoNotTrack() && (!checkEvents || (checkEvents && arrayContains(eventList, transmittedEvent))) && result.ps !== 'out') {
    result.lt = (new Date()).getTime();
    result.ev = transmittedEvent;
    const proto = (window.location.protocol.slice(0, 4) === 'http') ? window.location.protocol : 'https:';
    let baseUrl = baseUrlDE;
    if (result.cn && arrayContains(deSubdomain, result.cn)) {
      baseUrl = result.cn + deBaseUrl;
    } else if (result.cn && arrayContains(cntSubdomain, result.cn)) {
      baseUrl = result.cn + cntBaseUrl;
    }
    if (!(arrayContains(LSOBlacklist, result.st))
      && (((/iPhone/.test(window.navigator.userAgent) || /iPad/.test(window.navigator.userAgent))
        && /Safari/.test(window.navigator.userAgent) && !(/Chrome/.test(window.navigator.userAgent))
        && !(/CriOS/.test(window.navigator.userAgent))) || (/Maple_201/.test(window.navigator.userAgent)
        || /SMART-TV/.test(window.navigator.userAgent)))) {
      if (result.cn && arrayContains(deSubdomain, result.cn)) {
        baseUrl = result.cn + deBaseUrlLSO;
      } else if (result.cn && arrayContains(cntSubdomain, result.cn)) {
        baseUrl = result.cn + cntBaseUrlLSO;
      } else {
        baseUrl = baseUrlLSO;
      }
      mode = 3;
      if (Object.keys(result).includes('sur') && result.sur === 'yes') {
        result.u2 = window.location.origin;
      } else {
        result.u2 = document.URL;
      }
    }
    Object.keys(result).forEach((key) => {
      if (['cs', 'url'].includes(key) === false) {
        payLoad = `${payLoad + encodeURIComponent(key).slice(0, 8)}=${encodeURIComponent(result[key]).slice(0, 2048)}&`;
      }
    });
    payLoad = payLoad.slice(0, 4096);
    result.cs = hash(payLoad);
    result.url = `${proto}//${baseUrl}?${payLoad}cs=${result.cs}`;
    transmitData(result.url, mode);
    if (arrayContains(['play', 'resm', 'alve', 'mute', 'sfqt', 'ssqt', 'stqt', 'sapl', 'snsp'], transmittedEvent) && (mode === 1 || mode === 3)
      && Object.keys(result).includes('hb')) {
      // eslint-disable-next-line no-use-before-define
      startHeart();
    }
    return result;
  }
  return {};
}

function forwardToOldSZM() {
  if (result.oer === 'yes' && !window.IVW && !document.IVW) {
    const SZMProtocol = (window.location.protocol.slice(0, 4) === 'http') ? window.location.protocol : 'https:';
    const SZMComment = (result.co) ? `${result.co}_SENT_VIA_MIGRATION_TAG` : 'SENT_VIA_MIGRATION_TAG';
    const SZMContType = (result.pt !== null) ? result.pt : 'CP';
    let SZMCode;
    // Set SZM code and fall back to result.cp or empty code if necessary
    if (result.oc) {
      SZMCode = result.oc;
    } else if (!result.oc && result.cp) {
      SZMCode = result.cp;
    } else {
      SZMCode = emptyCode;
    }
    // eslint-disable-next-line max-len
    (new Image()).src = `${SZMProtocol}//${result.st}.ivwbox.de/cgi-bin/ivw/${SZMContType.toUpperCase()}/${SZMCode};${SZMComment}?r=${escape(document.referrer)}&d=${Math.random() * 100000}`;
  }
}

function init(params, m) {
  mode = m;
  buildResult(params);
  if (result.sv) {
    result.sv = (result.sv === 'in' && mode === 1) ? 'i2' : result.sv;
  }
  enableEvents();
  loadSurvey();
  inited = 1;
  forwardToOldSZM();
  return {};
}

function count(params, m) {
  init(params, m);
  return event(result.ev);
}

function hybrid(params, m) {
  init(params, m);
  const ioamSmi = (typeof localStorage === 'object' && typeof localStorage.getItem === 'function') ? localStorage.getItem('ioam_smi') : null;
  const ioamSite = (typeof localStorage === 'object' && typeof localStorage.getItem === 'function') ? localStorage.getItem('ioam_site') : null;
  const ioamBo = (typeof localStorage === 'object' && typeof localStorage.getItem === 'function') ? localStorage.getItem('ioam_bo') : null;
  if (ioamSmi !== null && ioamSite !== null && ioamBo !== null) {
    result.mi = ioamSmi;
    result.fs = result.st;
    result.st = ioamSite;
    result.bo = ioamBo;
    if (result.fs === result.st) {
      result.cp = (result.cp.slice(0, 10) !== '___hyb2___') ? `___hyb2___${result.fs}___${result.cp}` : result.cp;
    } else {
      result.cp = (result.cp.slice(0, 9) !== '___hyb___') ? `___hyb___${result.fs}___${result.cp}` : result.cp;
    }
    return event(result.ev);
  } if (ioamSmi !== null && ioamBo !== null) {
    return {};
  }
  if (window.location.protocol.slice(0, 4) !== 'http' || /IOAM\/\d+\.\d+/.test(window.navigator.userAgent)) {
    return {};
  }
  return event(result.ev);
}

function setMultiIdentifier(midentifier) {
  if (localStorage.getItem('ioamSmi') === null || localStorage.getItem('ioamSite') === null
    || localStorage.getItem('ioamBo') === null || localStorage.getItem('ioamSmi') !== midentifier) {
    result.fs = result.st;
    let JsonMIndetifier = null;
    let NewSite = null;
    if (typeof midentifier === 'string' && typeof JSON === 'object' && typeof JSON.parse === 'function') {
      try {
        JsonMIndetifier = JSON.parse(midentifier);
        if (Object.keys(JsonMIndetifier).includes('library')) {
          if (Object.keys(JsonMIndetifier.library).includes('offerIdentifier')) {
            if (JsonMIndetifier.library.offerIdentifier) {
              NewSite = JsonMIndetifier.library.offerIdentifier;
            } else {
              result.er = 'JSON(E10): offerIdentifier not valid';
            }
          } else {
            result.er = 'JSON(E10): no key offerIdentifier';
          }
        } else {
          result.er = 'JSON(E10): no key library';
        }
      } catch (err) {
        result.er = `JSON(E10): ${err}`;
      }
    }
    if (NewSite !== null) {
      localStorage.setItem('ioamSite', NewSite);
    }
    result.st = NewSite;
    result.mi = midentifier;
    result.bo = (new Date()).getTime();
    localStorage.setItem('ioamSmi', result.mi);
    localStorage.setItem('ioamBo', result.bo);
    if (result.fs === result.st) {
      result.cp = (result.cp.slice(0, 10) !== '___hyb2___') ? `___hyb2___${result.fs}___${result.cp}` : result.cp;
    } else {
      result.cp = (result.cp.slice(0, 9) !== '___hyb___') ? `___hyb___${result.fs}___${result.cp}` : result.cp;
    }
    return event(result.ev);
  }
  return {};
}

function optin() {
  const oiurl = (window.location.protocol.slice(0, 4) === 'http') ? window.location.protocol : `${'https://'}${optinUrl}`;
  const win = window.open(oiurl, '_blank');
  win.focus();
}

function startHeart() {
  // IE 9 Compatible
  function heartbeat() {
    return event('alve');
  }
  switch (result.hb) {
    case 'adshort':
      frequency = hbiAdShort;
      break;
    case 'admedium':
      frequency = hbiAdMedium;
      break;
    case 'adlong':
      frequency = hbiAdLong;
      break;
    case 'short':
      frequency = hbiShort;
      break;
    case 'medium':
      frequency = hbiMedium;
      break;
    case 'long':
      frequency = hbiLong;
      break;
    case 'extralong':
      frequency = hbiExtraLong;
      break;
    default:
      frequency = 0;
  }
  if (frequency !== 0) {
    try {
      heart = setInterval(heartbeat, frequency);
    } catch (e) {
      // pass
    }
  }
}

function stopHeart() {
  try {
    clearInterval(heart);
  } catch (e) {
    // pass
  }
}

function stringtohex(str) {
  const res = [];
  for (let n = 0, l = str.length; n < l; n += 1) {
    const hex = Number(str.charCodeAt(n)).toString(16);
    res.push(hex);
  }
  return res.join('');
}

function getUniqueID() {
  const max = 999999999999;
  const min = 100000000000;
  return (Math.floor(Math.random() * (max - min + 1)) + min).toString(16) + (Math.floor(Math.random() * (max - min + 1))
    + min).toString(16) + stringtohex(result.cb) + (Math.floor(Math.random() * (max - min + 1)) + min).toString(16);
}

function expireDays() {
  const max = 365;
  const min = 300;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getFpcd(cd) {
  let fpcdResult = '';
  const ctld = `acadaeafagaialamaoaqarasatauawaxazbabbbdbebfbgbhbibjbmbnbobrbsbtbwbybzcacccdcfcgchcickclcmcncocrcucvcwcxcyczdj
      dkdmdodzeceeegereseteufifjfkfmfofrgagdgegfggghgiglgmgngpgqgrgsgtgugwgyhkhmhnhrhthuidieiliminioiqirisitjejmjojpkekgkhkikmknkp
      krkwkykzlalblclilklrlsltlulvlymamcmdmemgmhmkmlmmmnmompmqmrmsmtmumvmwmxmymznancnenfngninlnonpnrnunzompapepfpgphpkplpmpnprpspt
      pwpyqarerorsrurwsasbscsdsesgshsiskslsmsnsosrssstsvsxsysztctdtftgthtjtktltmtntotrtttvtwtzuaugukusuyuzvavcvevgvivnvuwfwsyeytza
      zmzw`.match(/.{1,2}(?=(.{2})+(?!.))|.{1,2}$/g);
  const blkPrefixes = ['www', 'm', 'mobile'];
  const urlParts = cd.split('.');
  let ctldParts = [];
  let hostParts = [];
  let ctldPart = '';
  let hostPart = '';
  let i = 0;
  let iLen = 0;
  if (!cd) return '';
  if (arrayContains(ctld, urlParts[urlParts.length - 1])) {
    for (i = urlParts.length - 1; i >= 0; i -= 1) {
      if (i >= urlParts.length - 3 && urlParts[i].length <= 4) {
        ctldParts.push(urlParts[i]);
      } else {
        hostParts.push(urlParts[i]);
        break;
      }
    }
    ctldParts = ctldParts.reverse();
    for (i = 0, iLen = ctldParts.length; i < iLen; i += 1) {
      if (!arrayContains(blkPrefixes, ctldParts[i])) {
        ctldPart += i < iLen ? `.${ctldParts[i]}` : ctldParts[i];
      }
    }
    hostParts = hostParts.reverse();
    hostPart = hostParts[hostParts.length - 1] || '';
    if (arrayContains(blkPrefixes, hostPart)) {
      hostPart = '';
    }
  } else {
    hostPart = urlParts
      .slice(urlParts.length - 2, urlParts.length)
      .join('.') || '';
  }
  const fpcd = hostPart + ctldPart;
  // RFC 2109
  if (fpcd && fpcd.length > 4 && fpcd.split('.').length > 1) {
    fpcdResult += 'domain=';
    if (fpcd[0] === '.') {
      fpcdResult += fpcd;
    } else {
      fpcdResult += `.${fpcd}`;
    }
  }
  return fpcdResult;
}

function updateFirstPartyCookie(cookievalue) {
  const domain = getFpcd(window.location.hostname);
  const expireValue = cookievalue.split(':')[1];
  const events = parseInt(cookievalue.split(':')[4], 10) + 1;
  const expireDate = new Date(new Date().setTime(expireValue));
  const now = new Date();
  const site = (result.st) ? result.st : 'nosite';
  const evnt = (result.ev) ? result.ev : 'noevent';
  let code;
  if (result.cp) {
    code = result.cp;
  } else if (!result.cp && result.np) {
    code = result.np;
  } else if (!result.cp && !result.np && result.fp) {
    code = result.fp;
  } else {
    code = 'nocode';
  }
  let cookval = `${cookievalue.split(':').slice(0, 4).join(':')}:${events}:${site}:${code}:${evnt}:${now.getTime().toString()}`;
  cookval = `${cookval}:${hash(cookval)}`;
  document.cookie = `${cookieName}=${cookval};expires=${expireDate.toUTCString()};${domain};path=/;`;
}

function getFirstPartyCookie() {
  // FF Patch
  let cookie = '';
  try {
    cookie = document.cookie.split(';');
    for (let i = 0; i < cookie.length; i += 1) {
      if (cookie[i].match(`${cookieName}=.*`)) {
        const ourcookie = cookie[i].split('=')[1].replace('!', ':');
        const cookieParts = ourcookie.split(':');
        const firstCookieParts = cookieParts.slice(0, cookieParts.length - 1).join(':');
        const lastCookiePart = cookieParts.slice(-1).pop();
        if (hash(firstCookieParts) === lastCookiePart) {
          if (!Object.keys(result).includes('i3') || !result.i3) {
            updateFirstPartyCookie(ourcookie);
          }
          return {
            cookie: ourcookie,
            length: cookie.length,
          };
        }
        // checksum failed, cookie not trusted, delete cookie
        result.er = 'N19';
        try {
          if (cookieMaxRuns < 3) {
            cookieMaxRuns += 1;
            // eslint-disable-next-line no-use-before-define
            setFirstPartyCookie(2000);
          } else {
            result.er = 'N20';
          }
        } catch (e) {
          result.er = 'N20';
        }
      }
    }
  } catch (e) {
    return { cookie: 'nocookie', length: 0 };
  }
  return { cookie: 'nocookie', length: cookie.length };
}

function checkFirstPartyCookie() {
  const cookie = getFirstPartyCookie();
  return cookie.cookie !== 'nocookie';
}

function setFirstPartyCookie(expire) {
  if (!expire) {
    // eslint-disable-next-line no-param-reassign
    expire = expireDays() * 24 * 60 * 60 * 1000;
  }
  const domain = getFpcd(window.location.hostname);
  const expireDate = new Date(new Date().setTime(new Date().getTime() + expire));
  const setDate = new Date();
  let identifier;
  let code;
  const site = result.st ? result.st : 'nosite';
  const evnt = (result.ev) ? result.ev : 'noevent';
  // Set code and use multiple fallbacks if possible
  if (result.cp) {
    code = result.cp;
  } else if (!result.cp && result.np) {
    code = result.np;
  } else if (!result.cp && !result.np && result.fp) {
    code = result.fp;
  } else {
    code = 'nocode';
  }
  if (Object.keys(result).includes('i2')) {
    identifier = result.i2;
  } else {
    identifier = getUniqueID();
  }
  let cookval = `${identifier}:${expireDate.getTime().toString()}:${setDate.getTime().toString()}:${domain.replace('domain=', '')
    .replace(';', '')}:1:${site}:${code}:${evnt}:${setDate.getTime().toString()}`;
  cookval = `${cookval}:${hash(cookval)}`;
  document.cookie = `${cookieName}=${cookval};expires=${expireDate.toUTCString()};${domain};path=/;`;
  if (!checkFirstPartyCookie()) {
    // cookie not found, try it without domain
    document.cookie = `${cookieName}=${cookval};expires=${expireDate.toUTCString()};path=/;`;
    result.er = 'N25';
    if (!checkFirstPartyCookie()) {
      result.er = 'N26';
      return 'nocookie';
    }
  }
  return cookval;
}

function createCORSRequest(method, url) {
  let xdhreq = new XMLHttpRequest();
  if ('withCredentials' in xdhreq) {
    xdhreq.open(method, url, true);
    xdhreq.withCredentials = true;
  } else if (typeof XDomainRequest !== 'undefined') {
    // eslint-disable-next-line no-undef
    xdhreq = new XDomainRequest();
    xdhreq.open(method, url);
  } else {
    xdhreq = null;
  }
  return xdhreq;
}

function getPlus() {
  if (typeof localStorage === 'object' && typeof localStorage.getItem === 'function') {
    if (localStorage.getItem('ioamplusdata') !== null && localStorage.getItem('ioamplusttl') !== null) {
      const currentDate = new Date();
      const now = currentDate.getTime();
      currentDate.setTime(localStorage.getItem('ioamplusttl'));
      if (now <= currentDate.getTime()) {
        return true;
      }
    }
    const checkForSocio = `${'https://'}${ioplusurl}/soziodata2.php?sc=${socioToken}&st=${result.st}&id=${result.id}`;
    const XHR = createCORSRequest('GET', checkForSocio);
    if (XHR) {
      XHR.onload = function onload() {
        const response = XHR.responseText;
        const blockedUntilDate = new Date();
        try {
          if ((response.split(':')[1].split(',')[0]) === '0') {
            blockedUntilDate.setTime(blockedUntilDate.getTime() + lsottlmin);
            localStorage.setItem('ioamplusttl', blockedUntilDate.getTime().toString());
            if (localStorage.getItem('ioamplusdata') == null) {
              localStorage.setItem('ioamplusdata', response);
            }
          } else {
            blockedUntilDate.setTime(blockedUntilDate.getTime() + lsottl);
            localStorage.setItem('ioamplusdata', response);
            localStorage.setItem('ioamplusttl', blockedUntilDate.getTime().toString());
          }
        } catch (e) {
          // pass
        }
      };
      XHR.send();
      return true;
    }
  }
  return false;
}

/**
 * Factory for the IOM tracking library
 *
 * @return {Object} Tracking library
 */
export default function iomFactory() {
  // Bind post message handler for wm tag
  if (window.postMessage || (window.JSON && {}.toString.call(window.JSON.parse) !== '[object Function]'
    && {}.toString.call(window.JSON.stringify) !== '[object Function]')) {
    const listener = function listener(msg) {
      let msgdata;
      try {
        msgdata = JSON.parse(msg.data);
      } catch (e) {
        msgdata = { type: false };
      }
      if ({}.toString.call(msgdata) === '[object Object]' && msgdata.type === 'iam_data') {
        const respObj = {
          seq: msgdata.seq,
          iam_data: {
            st: result.st,
            cp: result.cp,
          },
        };
        msg.source.postMessage(JSON.stringify(respObj), msg.origin);
      }
    };
    if (typeof window.addEventListener !== 'function') {
      window.addEventListener('message', listener);
    } else if (typeof window.addEventListener !== 'function' && typeof window.attachEvent === 'function') {
      // IE < 8 fallback
      window.attachEvent('onmessage', listener);
    }
  }
  return {
    count,
    c: count,
    i: init,
    init,
    e: event,
    event,
    h: hybrid,
    hybrid,
    setMultiIdentifier,
    smi: setMultiIdentifier,
    oi: optin,
    optin,
    getInvitation,
    gi: getInvitation,
    getPlus,
    gp: getPlus,
  };
}
