/* eslint-env browser */
/* globals VENDOR_FULL_NAME */
// eslint-disable-next-line import/no-extraneous-dependencies
import { MDCTabBar } from '@material/tabs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MDCRipple } from '@material/ripple';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MDCTextField } from '@material/textfield';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MDCSelect } from '@material/select';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MDCCheckbox } from '@material/checkbox';
import { driver } from './driver';
import {
  capitalize,
  getSelectedProfile,
  getProfilesCount,
  removeAllChildren,
  log,
} from './utils';

import '../styles/popup.scss';

// Query the components
const dynamicTabBar = new MDCTabBar(document.querySelector('#toolbar'));
const dots = document.querySelector('.dots');
const panels = document.querySelector('.panels');
const saveProfileButton = document.querySelector('#save-profile-button');
const textFields = [].slice.call(document.querySelectorAll('.mdc-text-field'))
  .map(node => new MDCTextField(node));
const genderSelect = document.getElementById('gender-select-field');
const genderSelectComponent = new MDCSelect(genderSelect);

let profileCheckBoxes = [];

// Attach ripple effect to all buttons
[].slice.call(document.querySelectorAll('.mdc-button')).forEach(node => MDCRipple.attachTo(node));

// Prevent default event click bubbling
dynamicTabBar.tabs.forEach((tab) => {
  // eslint-disable-next-line no-param-reassign
  tab.preventDefaultOnClick = true;
});

/**
 * @typedef {Object} Profile
 * @property {String} email - The email address of the profile
 * @property {Number} age - The age of the profile
 * @property {String} gender - The gender of the profile
*/

// ------------- Communication with background script ------------- //

/**
 * Sends a command to the background script
 *
 * @param {String} command - Command to send
 * @param {*} [data] - Optional data
 * @returns {Promise<void>}
 */
const callEventPageMethod = async (command, data) => {
  try {
    const response = await driver.runtime.sendMessage({ command, data });
    if (response) {
      log('info', `Command ${command} successfully sent to background script.`);
    } else {
      throw new Error(`Command ${command} failed to sent to background script.`);
    }
  } catch (err) {
    log('error', err);
  }
};

// ------------------ Event listener methods ---------------------- //

/**
 * Listener for selection events on the profile list
 *
 * @param {Object} event - Emitted event
 * @return {Promise<void>} Void
 */
const selectProfile = async (event) => {
  try {
    const { checked } = event.target;
    const listItem = event.target.closest('.mdc-list-item');
    const email = listItem.getAttribute('data-value');
    const store = await driver.storage.local.get('profiles');
    for (let i = 0, iLen = store.profiles.length; i < iLen; i += 1) {
      const profile = store.profiles[i];
      profile.selected = profile.email === email && checked;
    }
    // eslint-disable-next-line no-use-before-define
    deselectProfiles(event.target);
    await driver.storage.local.set(store);
    // Inform background script
    await callEventPageMethod('switchProfile');
    if (!await getSelectedProfile(driver)) {
      // eslint-disable-next-line no-use-before-define
      enableSelectProfileButton();
    } else if (await getProfilesCount(driver) === 0) {
      // eslint-disable-next-line no-use-before-define
      enableCreateProfileButton();
    } else {
      // eslint-disable-next-line no-use-before-define
      enableSwitchProfileButton();
    }
    log('info', `Profile with email ${email} successful selected`);
  } catch (err) {
    log('error', err);
  }
};
/**
 * Saves the profile form information into the local storage and updates
 * the profile list
 *
 * @return {Promise<void>} Void
 */
const saveProfile = async () => {
  try {
    const profile = {};
    let { profiles: localProfiles } = await driver.storage.local.get('profiles');
    // Extract values from the text fields
    for (let i = 0, iLen = textFields.length; i < iLen; i += 1) {
      const textField = textFields[i];
      // eslint-disable-next-line no-underscore-dangle
      const key = textField.input_.getAttribute('id').split('-')[0];
      // eslint-disable-next-line no-underscore-dangle
      profile[key] = textField.input_.value;
    }
    // Extract value from the gender selection
    profile.gender = genderSelectComponent.selectedOptions[0].getAttribute('data-value');
    profile.selected = false;
    // Check if local profile exists in local store
    if (localProfiles && localProfiles.length > 0) {
      const pos = localProfiles.findIndex(item => item.email === profile.email);
      if (pos > -1) {
        // Update profile
        localProfiles[pos] = profile;
      } else {
        // Add new profile
        localProfiles.push(profile);
      }
    } else {
      // It's the first profile so mark it as selected
      profile.selected = true;
      // Local profiles are not defined yet so we have to initialize them
      localProfiles = [];
      // Push profile to current local profile collection
      localProfiles.push(profile);
    }
    // Save profiles to local storage
    await driver.storage.local.set({ profiles: localProfiles });
    // Inform background script
    await callEventPageMethod('switchProfile');
    // Update profile list
    // eslint-disable-next-line no-use-before-define
    await updateProfileList();
    // Clear the profile form
    // eslint-disable-next-line no-use-before-define
    clearProfileForm();
    // Enable profile view
    // eslint-disable-next-line no-use-before-define
    enableProfileList();
    log('info', `Profile with email ${profile.email} successful saved`);
  } catch (err) {
    log('error', err);
  }
};

/**
 * Listener for remove operations on profiles
 *
 * @param {Object} event - The emitted click event
 * @return {Promise<void>} Void
 */
const removeProfile = async (event) => {
  const email = event.target.closest('.mdc-list-item').getAttribute('data-value');
  const store = await driver.storage.local.get('profiles');
  const pos = store.profiles.findIndex(profile => profile.email === email);
  if (pos > -1) {
    store.profiles.splice(pos, 1);
  }
  if (store.profiles.length > 0) {
    store.profiles[0].selected = true;
  }
  // Save profiles collection to local storage
  await driver.storage.local.set(store);
  // Inform background script
  await callEventPageMethod('switchProfile');
  // Update profile list
  // eslint-disable-next-line no-use-before-define
  await updateProfileList();
  log('info', `Profile with email ${email} successful removed`);
};

/**
 * Listener for edit operations on profile list entries
 *
 * @param {Event} event - The emitted click event
 * @return {Promise<void>} Void
 */
const editProfile = async (event) => {
  const email = event.target.closest('.mdc-list-item').getAttribute('data-value');
  const store = await driver.storage.local.get('profiles');
  const profile = store.profiles.find(item => item.email === email);
  // Fill text fields with values
  for (let i = 0, iLen = textFields.length; i < iLen; i += 1) {
    const textField = textFields[i];
    // eslint-disable-next-line no-underscore-dangle
    const key = textField.input_.getAttribute('id').split('-')[0];
    // eslint-disable-next-line no-underscore-dangle
    textField.input_.value = profile[key];
    // eslint-disable-next-line no-underscore-dangle
    textField.label_.root_.classList.add('mdc-text-field__label--float-above');
  }
  genderSelectComponent.selectedIndex = genderSelectComponent.options
    .findIndex(node => node.getAttribute('data-value') === profile.gender);
  // eslint-disable-next-line no-underscore-dangle
  genderSelectComponent.label_.classList.add('mdc-select__label--float-above');
  // eslint-disable-next-line no-use-before-define
  await enableProfileForm();
};
/**
 * Creates a switch function for transitioning to the profile view
 *
 * @param {String} [target='list'] - The profile view target (e.g. list or form)
 * @return {Promise.<void>} Profile switch function as void promise
 */
const switchToProfileView = (target = 'list') => async () => {
  dynamicTabBar.activeTabIndex = 1;
  // eslint-disable-next-line no-use-before-define
  updatePanel(1);
  // eslint-disable-next-line no-use-before-define
  updateDot(1);
  if (target === 'list') {
    // eslint-disable-next-line no-use-before-define
    enableProfileList();
  } else {
    // eslint-disable-next-line no-use-before-define
    await enableProfileForm();
    // eslint-disable-next-line no-use-before-define
    validateProfileForm();
  }
};
/**
 * Validates the profile form and all it's descendants against
 * html5 validation rules or own rules.
 */
const validateProfileForm = () => {
  const results = [];
  // Check validity of all text fields
  for (let i = 0, iLen = textFields.length; i < iLen; i += 1) {
    const textField = textFields[i];
    // Use HTML5 validation api to validate native import
    // eslint-disable-next-line no-underscore-dangle
    results.push(textField.input_.checkValidity());
  }
  // Check validity of gender selection
  const gender = genderSelectComponent.selectedOptions.length > 0
    ? genderSelectComponent.selectedOptions[0].getAttribute('data-value')
    : undefined;
  // Check if gender is female or male
  results.push(['female', 'male'].includes(gender));
  // Check overall validity
  if (results.filter(item => item === false).length > 0) {
    // Deactivate save button because of invalid form
    saveProfileButton.setAttribute('disabled', 'disabled');
    saveProfileButton.classList.remove('mdc-theme--secondary-bg');
  } else {
    // Activate save button because of valid form
    saveProfileButton.removeAttribute('disabled');
    saveProfileButton.classList.add('mdc-theme--secondary-bg');
  }
};

// --------------- DOM manipulation method ------------------- //
/**
 * Enables the profile selection list
 */
const enableProfileList = () => {
  const profileList = document.querySelector('#profile-list');
  const profileForm = document.querySelector('#profile-form');
  const addProfileFab = document.querySelector('#add-profile-fab');
  // Switch active profile view
  profileList.classList.add('profile-view--active');
  profileForm.classList.remove('profile-view--active');
  addProfileFab.classList.remove('mdc-fab--exited');
};
/**
 * Enables the profile form
 */
const enableProfileForm = async () => {
  const profileList = document.querySelector('#profile-list');
  const profileForm = document.querySelector('#profile-form');
  const addProfileFab = document.querySelector('#add-profile-fab');
  const cancelProfileButton = document.querySelector('#cancel-profile-button');
  // Check if profiles are already defined
  // When not deactivate the cancel button
  if (await getProfilesCount(driver) === 0) {
    cancelProfileButton.setAttribute('disabled', 'disabled');
  } else {
    cancelProfileButton.removeAttribute('disabled');
  }
  // Switch active profile view
  profileList.classList.remove('profile-view--active');
  profileForm.classList.add('profile-view--active');
  addProfileFab.classList.add('mdc-fab--exited');
};

/**
 * Enables the profile selected button
 */
const enableSelectProfileButton = () => {
  const container = document.querySelector('#profile-buttons');
  const template = document.querySelector('#select-profile-button-template');
  const clone = document.importNode(template.content, true);
  removeAllChildren(container);
  container.appendChild(clone);
  const button = document.querySelector('#select-profile-button');
  const i18nKey = button.getAttribute('data-i18n-key');
  button.innerHTML = driver.i18n.getMessage(i18nKey);
  button.addEventListener('click', switchToProfileView());
};

/**
 * Enables the profile switch button
 */
const enableSwitchProfileButton = () => {
  const container = document.querySelector('#profile-buttons');
  const template = document.querySelector('#switch-profile-button-template');
  const clone = document.importNode(template.content, true);
  removeAllChildren(container);
  container.appendChild(clone);
  const button = document.querySelector('#switch-profile-button');
  const i18nKey = button.getAttribute('data-i18n-key');
  button.innerHTML = driver.i18n.getMessage(i18nKey);
  button.addEventListener('click', switchToProfileView());
};

/**
 * Enables the profile creation button
 */
const enableCreateProfileButton = () => {
  const container = document.querySelector('#profile-buttons');
  const template = document.querySelector('#create-profile-button-template');
  const clone = document.importNode(template.content, true);
  removeAllChildren(container);
  container.appendChild(clone);
  const button = document.querySelector('#create-profile-button');
  const i18nKey = button.getAttribute('data-i18n-key');
  button.innerHTML = driver.i18n.getMessage(i18nKey);
  button.addEventListener('click', switchToProfileView('form'));
};
/**
 * Clears the profile form and all its values
 */
const clearProfileForm = () => {
  // Extract values from the text fields
  for (let i = 0, iLen = textFields.length; i < iLen; i += 1) {
    const textField = textFields[i];
    // eslint-disable-next-line no-underscore-dangle
    textField.input_.value = '';
    // eslint-disable-next-line no-underscore-dangle
    textField.label_.root_.classList.remove('mdc-text-field__label--float-above');
  }
  genderSelectComponent.selectedIndex = -1;
  // eslint-disable-next-line no-underscore-dangle
  genderSelectComponent.label_.classList.remove('mdc-select__label--float-above');
};
/**
 * Deselects profiles which are not equal than the provided target
 *
 * @param {Element} target - The target dom element
 */
const deselectProfiles = (target) => {
  const profileList = target.closest('.mdc-list');
  const checkboxes = [].slice.call(profileList.querySelectorAll('.mdc-checkbox > input'))
    .filter(item => item !== target);
  if (checkboxes && checkboxes.length > 0) {
    for (let i = 0, iLen = checkboxes.length; i < iLen; i += 1) {
      const checkbox = checkboxes[i];
      checkbox.checked = false;
    }
  }
};
/**
 * Creates the profile list
 *
 * @param {Array.<Object>} profiles - Collection profile meta information
 * @param {Element} container - The profile list wrapper container
 * @return {Element} The profile list wrapper container with the build profile list
 */
const createProfileList = (profiles, container) => {
  const createCheckBox = (item) => {
    const checkbox = document.createElement('div');
    const input = document.createElement('input');
    const background = document.createElement('div');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const mixedMarker = document.createElement('div');
    // Add classes add attributes
    // Checkbox container
    checkbox.classList.add('mdc-checkbox', 'checkbox--custom-all');
    // Input
    input.classList.add('mdc-checkbox__native-control');
    input.setAttribute('type', 'checkbox');
    input.checked = item.selected;
    // Background
    background.classList.add('mdc-checkbox__background');
    // Svg
    svg.classList.add('mdc-checkbox__checkmark');
    svg.setAttribute('viewBox', '0 0 24 24');
    // Svg path
    path.classList.add('mdc-checkbox__checkmark__path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'white');
    path.setAttribute('d', 'M1.73,12.91 8.1,19.28 22.79,4.59');
    // Mixed marker
    mixedMarker.classList.add('mdc-checkbox__mixedmark');
    // Build dom element
    // Svg
    svg.appendChild(path);
    // Background
    background.appendChild(svg);
    background.appendChild(mixedMarker);
    // checkbox
    checkbox.appendChild(input);
    checkbox.appendChild(background);
    return checkbox;
  };
  /**
   * Creates the profile list container and appends the list items to it
   *
   * @param {Array.<Element>} elements - The list items
   * @return {Element} - The profile list container
   */
  const createList = (elements) => {
    const list = document.createElement('ul');
    list.classList.add('mdc-list', 'mdc-list--two-line', 'mdc-list--avatar-list', 'profile-list');
    elements.forEach(node => list.appendChild(node));
    return list;
  };
  /**
   * Creates the list items
   *
   * @param {Array.<Profile>} items - Collection of profiles
   * @returns {Array.<Element>} Collection of list items
   */
  const createListElements = items => items.map((item) => {
    // List item
    const listItem = document.createElement('li');
    // Avatar node
    const avatar = document.createElement('span');
    // Checkbox node
    const checkbox = createCheckBox(item);
    // Primary node
    const primary = document.createElement('span');
    // Secondary node
    const secondary = document.createElement('span');
    // Primary text node
    const primaryText = document.createTextNode(item.email);
    // Retrieve right i18n gender message for secondary text node
    const i18nSecondaryText = driver.i18n
      .getMessage(`profileListItemSecondaryText${capitalize(item.gender)}`);
    // Secondary text node
    const secondaryText = document.createTextNode(i18nSecondaryText);
    // List actions
    const actions = document.createElement('span');
    // Remove action icon
    const removeAction = document.createElement('i');
    // Remove action text
    const removeActionText = document.createTextNode('delete');
    // Add classes
    // List item container
    listItem.classList.add('mdc-list-item', 'list-item--left-padding-fix', 'clickable');
    listItem.setAttribute('data-value', item.email);
    // Avatar css classes
    avatar.classList.add('mdc-list-item__graphic');
    // Primary node css classes
    primary.classList.add('mdc-list-item__text');
    // Secondary node css classes
    secondary.classList.add('mdc-list-item__secondary-text');
    // Action css classes and attributes
    actions.classList.add('mdc-list-item__meta');
    // Set classes and attributes for remove action
    removeAction.classList.add('material-icons');
    removeAction.setAttribute('aria-label', 'Remove profile');
    // Append text nodes to actions
    removeAction.appendChild(removeActionText);
    // Append actions to action container
    actions.appendChild(removeAction);
    // Append checkbox to avatar container
    avatar.appendChild(checkbox);
    // Append text nodes
    primary.appendChild(primaryText);
    secondary.appendChild(secondaryText);
    primary.appendChild(secondary);
    // Append nodes
    listItem.appendChild(avatar);
    listItem.appendChild(primary);
    listItem.appendChild(actions);
    return listItem;
  });
  /**
   * Creates a sub header for the list.
   *
   * @returns {HTMLHeadingElement} - Sub header element.
   */
  const createSubHeader = () => {
    const i18nMessage = driver.i18n.getMessage('profileListSubHeaderText');
    const subHeader = document.createElement('h3');
    const subHeaderText = document.createTextNode(i18nMessage);
    subHeader.classList.add('mdc-list-group__subheader');
    subHeader.appendChild(subHeaderText);
    return subHeader;
  };

  try {
    if (profiles.length > 0) {
      if (container) {
        const elements = createListElements(profiles);
        const list = createList(elements);
        const subHeader = createSubHeader();
        container.appendChild(subHeader);
        container.appendChild(list);
      }
    }
    return container;
  } catch (err) {
    throw err;
  }
};
/**
 * Updates the profile list
 *
 * @return {Promise<void>} Void
 */
const updateProfileList = async () => {
  try {
    const container = document.querySelector('#profile-list');
    const store = await driver.storage.local.get('profiles');
    if (store.profiles && store.profiles.length > 0) {
      const profileSelected = store.profiles
        .filter(profile => profile.selected === true).length > 0;
      // Remove all checkbox listener from all check boxes when
      // current checkbox collection is filled
      if (profileCheckBoxes.length > 0) {
        for (let i = 0, iLen = profileCheckBoxes.length; i < iLen; i += 1) {
          const checkbox = profileCheckBoxes[i];
          checkbox.unlisten('change', selectProfile);
        }
      }
      // Remove all children from container in DOM
      removeAllChildren(container);
      // Create profile list and append the to the DOM
      createProfileList(store.profiles, container);
      // Initialize MDC check box components
      profileCheckBoxes = [].slice.call(document.querySelectorAll('.mdc-checkbox'))
        .map(node => new MDCCheckbox(node));
      // Bind checkbox listener to check box elements
      for (let i = 0, iLen = profileCheckBoxes.length; i < iLen; i += 1) {
        const checkbox = profileCheckBoxes[i];
        checkbox.listen('change', selectProfile);
      }
      const removeActions = [].slice
        .call(document.querySelectorAll('.mdc-list-item__meta > i:last-child'));
      // Add ripple effect to all list items
      [].slice.call(document.querySelectorAll('.mdc-list-item'))
        .map(node => new MDCRipple(node));
      const listItems = [].slice.call(document.querySelectorAll('.mdc-list-item__text'));
      // Bind click listener to remove actions
      for (let i = 0, iLen = removeActions.length; i < iLen; i += 1) {
        const removeAction = removeActions[i];
        removeAction.addEventListener('click', removeProfile);
      }
      // Bind click listener to list items for editing profiles
      for (let i = 0, iLen = listItems.length; i < iLen; i += 1) {
        const listItem = listItems[i];
        listItem.addEventListener('click', editProfile);
      }
      // Enable profile list
      enableProfileList();
      if (profileSelected) {
        enableSwitchProfileButton();
      } else {
        enableSelectProfileButton();
      }
    } else {
      // Enable profile form
      await enableProfileForm();
      enableCreateProfileButton();
    }
  } catch (err) {
    log('error', err);
  }
};
/**
 * Updates the dot navigation indication on the bottom of the popup
 *
 * @param {Number} index - The navigation index
 */
const updateDot = (index) => {
  const activeDot = dots.querySelector('.dot.active');
  if (activeDot) {
    activeDot.classList.remove('active');
  }
  const newActiveDot = dots.querySelector(`.dot:nth-child(${index + 1})`);
  if (newActiveDot) {
    newActiveDot.classList.add('active');
  }
};
/**
 * Updates the tab navigation indication on top of the popup
 *
 * @param {Number} index - The navigation index
 */
const updatePanel = (index) => {
  const activePanel = panels.querySelector('.panel.active');
  if (activePanel) {
    activePanel.classList.remove('active');
  }
  const newActivePanel = panels.querySelector(`.panel:nth-child(${index + 1})`);
  if (newActivePanel) {
    newActivePanel.classList.add('active');
  }
  if (index === 1) {
    validateProfileForm();
  }
};
/**
 * Takes all DOM nodes which have "data-i18n-key" as attribute and retrieves the
 * the associated i18n message from the i18n store (driver.i18n) and will overwrite
 * the text node with this message.
 */
const fillI18nNodes = () => {
  try {
    const i18nNodes = [].slice.call(document.querySelectorAll('[data-i18n-key]'));
    if (i18nNodes.length > 0) {
      for (let i = 0, iLen = i18nNodes.length; i < iLen; i += 1) {
        const i18nNode = i18nNodes[i];
        const i18nKey = i18nNode.getAttribute('data-i18n-key');
        let message;
        // The i18n message collection has one item which contains a placeholder.
        // So we have to process this entry independently from the others.
        if (i18nKey === 'panelIntroductionDescriptionText') {
          // eslint-disable-next-line no-await-in-loop
          message = driver.i18n.getMessage(i18nKey, VENDOR_FULL_NAME);
        } else {
          // eslint-disable-next-line no-await-in-loop
          message = driver.i18n.getMessage(i18nKey);
        }
        if (message) {
          // Some i18n nodes have aria labels defined.
          // So we have to set the aria label when key contains aria key word.
          if (i18nKey.toLocaleLowerCase().includes('aria')) {
            i18nNode.setAttribute('aria-label', message);
          } else {
            i18nNode.innerHTML = message;
          }
        }
      }
    }
  } catch (err) {
    log('error', err);
  }
};

// ------------------ Event binding -------------------------- //

// Bind listener to tab change events
dynamicTabBar.listen('MDCTabBar:change', ({ detail: tabs }) => {
  const nthChildIndex = tabs.activeTabIndex;
  updatePanel(nthChildIndex);
  updateDot(nthChildIndex);
});
// Bind a listener for click events emitted from the dots
dots.addEventListener('click', (event) => {
  if (!event.target.classList.contains('dot')) {
    // Do nothing when event target is not a dot
    return;
  }
  // Prevent event bubbling
  event.preventDefault();
  // Determine dot index
  const dotIndex = [].slice.call(dots.querySelectorAll('.dot')).indexOf(event.target);
  // Set dynamic tab index to do index
  if (dotIndex >= 0) {
    dynamicTabBar.activeTabIndex = dotIndex;
  }
  // Update ui
  updatePanel(dotIndex);
  updateDot(dotIndex);
});
// Add click handler to create profile button
saveProfileButton.addEventListener('click', saveProfile);
// Add click handler for the add fab
document.querySelector('#add-profile-fab')
  .addEventListener('click', async () => {
    clearProfileForm();
    await enableProfileForm();
  });
// Add click handler for the cancel button in the profile form
document.querySelector('#cancel-profile-button')
  .addEventListener('click', () => {
    clearProfileForm();
    enableProfileList();
  });
// Bind change events to all profile form text fields
for (let i = 0, iLen = textFields.length; i < iLen; i += 1) {
  const textField = textFields[i];
  // eslint-disable-next-line no-underscore-dangle
  const nativeInput = textField.input_;
  // Bind form validation method on change event
  nativeInput.addEventListener('change', validateProfileForm);
}
// Bind change event to gender select component
genderSelectComponent.listen('MDCSelect:change', validateProfileForm);

// --------------------- Initialization -------------------------- //

// Fill all text nodes with i18n messages
fillI18nNodes();
// Build fresh profile list
Promise.resolve(updateProfileList());
