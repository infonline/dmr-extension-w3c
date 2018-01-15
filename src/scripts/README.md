### Scripts folder

This folder contains the javascript assets of the IMAREX extension. Any changes to the filename implies a change of the `manifest.json` file in the `src` folder. Any change of the filename will cause the build process and the extension to fail.

#### Background script

**Filename:** `background.js`

**Description:** This is the background script of the IMAREX extension. The script hosts the backend logic of the extension. It will load and inject the iam.js, emits count events to the content scripts and will observe any navigation events in the browser.

#### Content script

**Filename:** `content.js`

**Description:** This is the content script of the IMAREX extension with access to the DOM of the current active tab. It will host the API call for counting a page request via the iam.js

#### Browser actions

**Filename:** `popup.js`

**Description:** This javascript file contains the frontend logic of the browser action popup. It host the logic for managing profiles and will communicate with the background script when any information regarding profiles is manipulated.

#### Polyfill

**Filename:** `polyfill.js`

**Description:** This file contains the polyfill for all browsers who are not capable of using promises instead of callbacks in the web extension runtime. The polyfill takes all web extension api methods with callbacks, creates a shadow of them and maps the callback logic to a promise based logic. The references of the new created api methods will be hosted in a weak map to reduce the page consumption and to benefit from the garbage collection of the browser's jit compiler. This step is necessary to develop one code base, which works in any browser who supports the web extension standard by the w3c. In the future, when all browser manufacturers have agreed to use one API for web extensions this polyfill can be easily deactivated via driver factory. (see next)

#### Browser runtime driver

**Filename:** `driver.js`

**Description:** This file contains the driver factory which takes the vendor string (injected via build process) and loads the polyfill with the correct local web extension runtime. This factory is needed because of the different implementations by the browser manufactures:

| Vendor | Runtime          | Promise | Callbacks |
|--------|------------------|---------|-----------|
| Chrome | `window.chrome`  | no      | yes       |
| Edge   | `window.browser` | no      | yes       |
| Firefox| `window.browser` | yes     | no        |
| Opera  | `window.chrome`  | no      | yes       |

#### Utilities

**Filename:** `utils.js`

**Description:** This file contains share methods and logic for all javascript assets. It's general pattern to move shareable code to separate modules to stay [DRY](https://de.wikipedia.org/wiki/Don%E2%80%99t_repeat_yourself).

#### Build process

All javascript assets will be processed by a build pipeline which transpiles the source to a code base which works on all target browser (chrome, edge, firefox and opera). At the end only the necessary scripts (background.js, content.js, popup.js) are visible. Imported modules are handled by the webpack runtime which is also included to the files mentioned before. According to the preferred target environment (e.g. production) the assets are minified.
