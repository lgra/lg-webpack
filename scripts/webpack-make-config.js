/* usage :

var makeWebPackConfig = require('./scripts/webpack-make-config')

module.exports = makeWebPackConfig({
  mode: "dev",
  port: 3000,
}))

makeWebPackConfig(options) build a config file to be used as arguments of webpack(config)
- dev and prod mode
- custom entry file and dest directory (can build multiple app in the same repo)
- transpile and inline css using postCss and cssNext
- extra module search in submodules directories, applying this project babelrc configuration
- inject alternative css or js in submodules while transpiling
- ready for use with server.js script in dev mode
- hot reload for REACT, preserving component state - without the side effect on component type comparison

options
  .entry: the main entry file to be transpile, defaulted to '[projectRoot]/src/index.js'
  .dest: the projet output directory, defaulted to '[projectRoot]/build'
  .mode: "dev" for hotloading developpement (alternativelly .dev: true), or "prod" or nothing to production build
  .subModuleDir: a path string or an array of path string where to get shared modules,
      when its not found in '[projectRoot]/web_modules' or '[projectRoot]/node_modules'
      eg.: path.resolve(projectRoot, 'vr-ui/web_modules') to search modules in vr-ui git submodule
  .alias: an optionnal map of alternative file or directory, applied to WebPack loader and PostCss.import
      See webpack.resolve.alias for enhanced documentation
      eg.: { '_shared/colors/controls.css': path.resolve(projectRoot, 'vr-ui/web_modules/_shared/colors/controls-legacy.css') }
  .replacement: an optionnal array of replacement spec object used with webpack.NormalModuleReplacementPlugin
      each object is {re: /a_regular_expression_passed_as_resourceRegExp_argument/, path: "a_string_passed_as_newResource_argument" }
  .port: http port to be serve by WebPackDevServer in dev mode, defaulted to 8080
  .host: http host to be serve by WebPackDevServer in dev mode, defaulted to 0.0.0.0
      0.0.0.0 is helpfull to be accessed externally using host IP
      'localhost' or require("os").hostname() are other possibilities
  .rules: extra rules (an array of rule objects, or a rule object if only one).
      eg. to copy json to dist folder (https://github.com/webpack/webpack/issues/6586) :
      rules: {
        type: 'javascript/auto',
        test: /\.json$/,
        // exclude: /(node_modules|package.json|src\/i18n)/,
        include: /src\/[^/]+\.json$/,
        use: [{
          loader: 'file-loader',
          options: { name: '[name].[ext]' },
        }],
      }

*/


var fs = require('fs')
var path = require('path')
var webpack = require('webpack')
var createResolver = require('./createResolver')

var projectRoot = process.cwd()
var packageOptions = require(path.resolve(projectRoot, 'package.json'))
// var externalLibs = Object.keys(packageOptions.hasOwnProperty('peerDependencies') ? packageOptions.peerDependencies : packageOptions.dependencies)

var nodeModuleDir = path.resolve(projectRoot, 'node_modules')
var webModuleDir = path.resolve(projectRoot, 'web_modules')

var babelOptions = JSON.parse(
  fs.readFileSync(path.resolve(projectRoot, '.babelrc'), 'utf8')
    .replace(/ *\/\/[^\n]*\n/, '')
    .replace(/\/\*.*\*\//g, '')
)

module.exports = function (_options, _transform) {
  _options = _options || {}
  if (_options.mode && _options.mode === 'dev') { _options.mode = 'development' }
  if (_options.mode && _options.mode === 'prod') { _options.mode = 'production' }
  var options = {
    entry: _options.entry || path.resolve(projectRoot, 'src/index.js'),
    dest: _options.dest || path.resolve(projectRoot, 'build'),
    mode: _options.mode || (_options.dev ? 'development' : 'production'),
    port: _options.port || process.env.npm_package_config_port || 8080,
    host: _options.host || null,
    rules: Boolean(_options.rules) ? (Array.isArray(_options.rules) ? _options.rules : [_options.rules]) : [],
    alias: _options.alias || {},
    replacement: _options.replacement || null,
    subModuleDir: _options.subModuleDir && (Array.isArray(_options.subModuleDir) ? _options.subModuleDir : [_options.subModuleDir]) || []
  }

  var babelParams = Object.assign({ babelrc: false }, babelOptions)

  var config = {
    mode: options.mode,

    entry: {
      app: [options.entry]
    },

    output: {
      path: options.dest,
      filename: '[name].js'
    },
    resolve: {
      modules: [nodeModuleDir, webModuleDir].concat(options.subModuleDir),
      alias: options.alias,
      extensions: [".js", ".jsx"] // Allow to omit extensions when requiring these files
    },
    module: {
      rules: [
        { test: /\.jsx?$/, use: [{ loader: "babel-loader", options: babelParams }, "eslint-loader"], exclude: [nodeModuleDir].concat(options.subModuleDir) },
        {
          test: /\.jsx?$/, use: [{ loader: "babel-loader", options: babelParams }], include: options.subModuleDir
        },
        {
          test: /\.css$/, use: [
            "style-loader",
            {
              loader: 'css-loader', options: {
                import: false,
                importLoaders: 1
              }
            },
            {
              loader: "postcss-loader", options: {
                ident: 'postcss',
                plugins: (loader) => [
                  require('postcss-import')({
                    skipDuplicates: true,
                    path: options.subModuleDir,
                    resolve: createResolver({
                      alias: config.resolve.alias,
                      modules: config.resolve.modules
                    })
                  }),
                  require('postcss-cssnext')(),
                  require("postcss-reporter")()
                ]
              }
            }]
        },
        { test: /\.html$/, use: "file-loader?name=[name].[ext]" },
        { test: /\.svg$/, use: "raw-loader" },
        { test: /\.md$/, use: "raw-loader" },
        { test: /\.(ico|jpe?g|png|gif)$/, use: "file-loader?name=[name].[ext]" },
        { test: /\.(woff|ttf|otf|eot\?#.+|svg#.+)$/, use: "file-loader?name=fonts/[name].[ext]" }
      ].concat(options.rules)
    },
    plugins: [
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /node_modules/, // you may add "vendor.js" here if you want to
            name: "vendor",
            chunks: "initial",
            enforce: true
          }
        }
      }
    }
  }
  if (options.replacement && options.replacement.length) {
    options.replacement.forEach(ref => {
      config.plugins.push(new webpack.NormalModuleReplacementPlugin(ref.re, ref.path))
    })
  }

  // for production : set React production mode - build vendor chunk - uglify and compress
  if (options.mode === "production") {
    config.entry.app.unshift('babel-polyfill')
    config.plugins.push(new webpack.DefinePlugin({ "process.env": { NODE_ENV: JSON.stringify("production") } }))
    config.optimization.minimize = true
  }

  // for development : configure local dev server - set react-hot-loader
  else if (options.mode === "development") {
    config.devServerUrl = {
      protocol: process.env.npm_package_config_protocol || "http://",
      hostname: options.host || process.env.npm_package_config_hostname || "0.0.0.0",
      listenTo: options.host || process.env.npm_package_config_hostname || "0.0.0.0",
      port: options.port
    }
    Object.defineProperty(config.devServerUrl, "url", { get: function () { return this.protocol + this.hostname + ":" + this.port } })
    config.devtool = "cheap-module-source-map" // "inline-source-map" produce huge file // "eval" doesn't provide usable source tree in dev tools

    // fix reacthotloader side effect when comparing proxified react object
    babelParams.plugins.push(path.resolve(projectRoot, 'scripts/babel-type-comparison'))

    config.entry.app.unshift('webpack/hot/dev-server')
    config.entry.app.unshift('webpack-dev-server/client?' + config.devServerUrl.url)
    config.entry.app.unshift('react-hot-loader/patch')
    config.entry.app.unshift('babel-polyfill')
    config.plugins.unshift(new webpack.NamedModulesPlugin())
    config.plugins.unshift(new webpack.HotModuleReplacementPlugin())
  }

  if (_transform && typeof _transform === 'function') {
    _transform(config)
  }

  return config
}
