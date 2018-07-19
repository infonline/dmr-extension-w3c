const path = require('path');
const args = require('../lib/args');

const assetsRoot = () => {
  if (args.vendor === 'edge') {
    // For edge browser the extension assets will be located into the Extension folder
    return `dist/${args.vendor}/Extension`;
  } else if (args.vendor === 'safari') {
    return `.temp/${args.vendor}/IMAREX`;
  }
  return `dist/${args.vendor}`;
};

module.exports = {
  output: path.resolve(__dirname, '../../', assetsRoot()),
  assetsRoot: assetsRoot(),
  assetsPublicPath: '/',
  extensionRoot: path.resolve(__dirname, '../../', `dist/${args.vendor}`),
  gzipExtensions: ['css', 'js'],
};
