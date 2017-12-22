// Import babel polyfill to allow async/await in code
// eslint-disable-next-line import/no-extraneous-dependencies
import 'babel-polyfill';
import requireDir from 'require-dir';

// Load all build tasks
requireDir('./build/tasks');
