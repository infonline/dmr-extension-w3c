const utils = require('../lib/utils');
const config = require('../config');
const args = require('../lib/args');

module.exports = {
  loaders: utils.createStyleLoaders({
    sourceMap: config.sourcemaps,
    extract: args.env === 'production',
  }),
  cssSourceMap: config.sourcemaps,
  cacheBusting: config.cacheBusting,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href',
  },
};
