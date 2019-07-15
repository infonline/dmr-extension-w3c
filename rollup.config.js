import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import css from 'rollup-plugin-css-only';
import { eslint } from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import copy from 'rollup-plugin-copy-glob';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-replace';
import vue from 'rollup-plugin-vue';
import * as pkg from './package.json';

const {
  version,
  author,
  name,
  inputs,
  distributions,
  license,
  description,
} = pkg;

const bannerText = `\
/**
 * ${name} v${version}
 *
 * ${description}
 *
 * @author ${author}
 * @license ${license}
 * @preserve
 */
`;
let dmrWebAppUrl = 'http://localhost:8080';
if (process.env.NODE_ENV === 'production') {
  dmrWebAppUrl = 'https://digitalmarketresearch.eu';
} else if (process.env.NODE_ENV === 'staging') {
  dmrWebAppUrl = 'https://dmr.infonline.de';
}
// Copy options
const COPYING_OPTIONS = [
  {
    files: 'src/popup/popup.html',
    dest: 'dist/bundle',
  },
  {
    files: 'src/images/*.png',
    dest: 'dist/bundle/images',
  },
  {
    files: 'src/locales/**/*.json',
    dest: 'dist/bundle/_locales',
  },
  {
    files: 'node_modules/webextension-polyfill/dist/browser-polyfill.js',
    dest: 'dist/bundle',
  },
  {
    files: 'node_modules/webextension-polyfill/dist/browser-polyfill.js.map',
    dest: 'dist/bundle',
  },
  {
    files: inputs.manifest,
    dest: 'dist/bundle/',
  },
];

const CSS_OPTIONS = {
  output: 'dist/bundle/popup.css',
};

const REPLACE_OPTIONS = {
  ENV: JSON.stringify(process.env.NODE_ENV),
  DMR_WEB_APP_URL: JSON.stringify(dmrWebAppUrl),
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
};

const VUE_OPTIONS = {
  template: {
    transformAssetUrls: false,
  },
};

const WATCH_OPTIONS = {
  include: 'src/**',
};

const PLUGINS = {
  STANDARD: [
    json(),
    eslint(),
    replace(REPLACE_OPTIONS),
    resolve(),
    babel({
      // only transpile our source code
      exclude: 'node_modules/**',
    }),
  ],
  VUE: [
    json(),
    eslint(),
    commonjs(),
    vue(VUE_OPTIONS),
    css(CSS_OPTIONS),
    replace(REPLACE_OPTIONS),
    resolve(),
    babel({
      // only transpile our source code
      exclude: 'node_modules/**',
    }),
    copy(COPYING_OPTIONS),
  ],
};

export default [
  {
    input: inputs.content,
    output: {
      format: 'iife',
      file: distributions.content,
      sourcemap: true,
      banner: bannerText,
    },
    plugins: PLUGINS.STANDARD,
    watch: WATCH_OPTIONS,
  },
  {
    input: inputs.background,
    output: {
      format: 'iife',
      file: distributions.background,
      sourcemap: true,
      banner: bannerText,
    },
    plugins: PLUGINS.STANDARD,
    watch: WATCH_OPTIONS,
  },
  {
    input: inputs.popup,
    output: {
      format: 'iife',
      dir: 'dist/bundle',
      sourcemap: true,
      banner: bannerText,
    },
    plugins: PLUGINS.VUE,
    watch: WATCH_OPTIONS,
  },
];