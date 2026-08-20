const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Ensure Metro resolves font assets (ttf, otf) from node_modules
config.resolver.assetExts = [
  ...(config.resolver.assetExts || []),
  'ttf',
  'otf',
];

module.exports = withNativeWind(config, { input: './global.css' });