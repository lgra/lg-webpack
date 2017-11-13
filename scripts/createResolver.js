// https://www.npmjs.com/package/postcss-import-webpack-resolver

const { NodeJsInputFileSystem, CachedInputFileSystem, ResolverFactory } = require('enhanced-resolve')

const defaultConfig = {
  extensions: ['.css'],
  modules: ['node_modules'],
  useSyncFileSystemCalls: true
}

module.exports = (config) => {
  const fileSystem = new CachedInputFileSystem(new NodeJsInputFileSystem(), 60000)
  const resolver = ResolverFactory.createResolver(
    Object.assign({ fileSystem }, defaultConfig, config)
  )
  
  return (id, basedir) => resolver.resolveSync({}, basedir, id);
}
