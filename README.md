## INFOnline web extension (imarex)

- [Documentation](docs/README.md)

### Download

    $ git clone git@vgitbn003.infon:IAM/iam-web-extension.git
    $ cd iam-web-extension

### Installation

    $ yarn install

or


    $ npm install

### Usage

**Note:** The default brower is chrome!

Run ```$ gulp --watch``` and load the ```dist```-directory into chrome.

## Tasks

### Build

    $ gulp


| Option         | Description                                                                            |
|----------------|----------------------------------------------------------------------------------------|
| `--watch`      | Starts a browser sync server and watches all assets.                                   |
| `--production` | Minifies all assets                                                                    |
| `--verbose`    | Log additional data to the console.                                                    |
| `--vendor`     | Compile the extension for different vendors (chrome, firefox, opera)  Default: chrome  |
| `--sourcemaps` | Force the creation of sourcemaps. Default: !production                                 |


### Packaging

Zips your `dist` directory and saves it in the `packages` directory.

    $ gulp pack --vendor=firefox

### Versioning

Increments version number of `manifest.json` and `package.json`,
commits the change to git and adds a git tag.

**Hint:** Please stick to a semantic versioning! 

    $ gulp patch      // => 0.0.X

or

    $ gulp minor    // => 0.X.0

or

    $ gulp major    // => X.0.
    
Please refer to [Semver](https://semver.org/) for more details on semantic versioning

### Status

|Browser|Status        |
|-------|--------------|
|Chrome |running       |
|Edge   |running       |
|Firefox|not running   |
|Opera  |running       |
|Safari |not tested yet|

On Firefox there is a Bug in the web extension javascript api:


    browser.runtime.onMessage.addListener(function (response, sender) {
      console.log(response, sender);
      var tabId = sender.tab.id;
      loadScript("https://script.ioam.de/iam.js", function (code) {
        browser.tabs.executeScript(tabId, {code: code})
          .then(function () {
            browser.tabs.executeScript(tabId, {file: 'count.js'})
          })
          .catch(function (err) {
            throw err;
          });
      });
    });

The injection of the iam.js triggers an error:

    Error: 'addEventListener' called on an object that does not implement interface EventTarget.
