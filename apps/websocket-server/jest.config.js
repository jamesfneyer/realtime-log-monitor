import { createRequire } from 'module'; 
const require = createRequire(import.meta.url);

const base = require('../../jest.config.base');
module.exports = {
  ...base,
  rootDir: './',
  // You can override/add service-specific config here if needed
};
