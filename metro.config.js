const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Watch the Example folder where the library resides
config.watchFolders = [projectRoot, path.resolve(projectRoot, 'Example')];

// Ensure Metro resolves the library correctly
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

module.exports = config;
