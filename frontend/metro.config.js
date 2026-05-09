const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.sourceExts.push('cjs', 'mjs');
config.resolver.unstable_enablePackageExports = true;

// Force CJS for zustand on web to avoid import.meta issues in ESM builds
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && (moduleName === 'zustand' || moduleName.startsWith('zustand/'))) {
    // Redirect to the root .js files which are CommonJS and use process.env instead of import.meta
    const cjsPath = moduleName === 'zustand' 
      ? 'zustand/index.js' 
      : moduleName.endsWith('.js') ? moduleName : `${moduleName}.js`;
    
    return context.resolveRequest(
      { ...context, resolveRequest: undefined },
      cjsPath,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
