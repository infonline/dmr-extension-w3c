## Digital Market Research by INFOnline - W3C compliant browser extension

- [Documentation](docs/README.md)

### Download

    $ git clone git@vgitbn003.infon:IAM/iam-web-extension.git
    $ cd iam-web-extension

### Installation

    $ yarn install

or


    $ npm install

### Usage

**Note:** The default browser is chrome!

Run ```$ node ./build/build.js --watch``` and load the ```dist```-directory into chrome.

### Requirements

* nodejs >= 8.0.0
* npm >= 5.0.0
* yarn >= 1.0.0

**For safari extension:**

* xcode >= 9.0.0
* swift >= 4.0.0

## CLI

### Build CLI

    $ node ./build/build.js


| Option                  | Description                                                                                           |
|-------------------------|-------------------------------------------------------------------------------------------------------|
| `--env`                 | Specifies the target environment (if production it will minify all source code) Default: 'development'|
| `--watch`               | Watches all source code assets and will recycle the build process on file change                      |
| `--vendor`              | Compile the extension for different vendors (chrome, firefox, opera)  Default: chrome                 |
| `--script-uri`          | Compile the extension with different INFOnline measurement script URI                                 |
| `--panel-exchange-uri`  | Compile the extension with a different IAM panel exchange URI                                         |
| `--sourcemaps`          | Force the creation of sourcemaps. Default: `env ==!production`                                        |
| `--pack`                | Will zip the built extension on the end and will copy it over the packaging directory                 |


**Notice:** It's currently not possible to build the safari extension via CI. The extension can be build locally with an Mac computer and install xcode build tools.

### Packaging

Builds the extension for the firefox browser, zips the `dist` directory and saves it in the `packages` directory.

    $ node./build/build.js --env production --pack --vendor firefox

### Versioning

Increments version number of `manifest.json` and `package.json`,
commits the change to git and adds a git tag.

**Hint:** Please stick to a semantic versioning! 

    $ yarn run bump:patch      // => 0.0.X

or

    $  yarn run bump:minor    // => 0.X.0

or

    $ yarn run bump:major    // => X.0.
    
Please refer to [Semver](https://semver.org/) for more details on semantic versioning

### Status

|Browser|Status               |
|-------|---------------------|
|Chrome |running              |
|Edge   |running              |
|Firefox|running              |
|Opera  |running              |
|Safari |running              |


(*) Currently the firefox will emit an error when injecting the iam.js via extension runtime into a running tab. A detailed error report and a possible fix are mentioned [here](/docs/FIREFOX.md).

(**) Apple are not participant in the [browser extension community group](https://www.w3.org/community/browserext/participants) for the web extension standard by the w3c. They have it's own API which is currently fully incompatible to mozilla's draft. There are no information about further plans from Apple to support mozilla's draft in the future. 
