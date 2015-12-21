// http://christianalfoni.github.io/javascript/2014/12/13/did-you-know-webpack-and-react-is-awesome.html#vendors

var path = require('path')
var webpack = require('webpack')
var node_modules_dir = path.resolve(__dirname, 'node_modules')

module.exports = function (options) {
  var config = {
    entry: {
      app: [path.resolve(__dirname, 'app/main.js')],
      vendors: []
    },
    resolve: {
      alias: {}
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'bundle.js'
    },
    module: {
      noParse: [],
      loaders: [
        {test: /\.jsx?$/, loaders: ["babel?experimental&optional=runtime"], exclude: [node_modules_dir]}
      ]
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
      new webpack.optimize.DedupePlugin()
    ]
  }

  function addVendor (name, filePath) {
    config.entry.vendors.push(filePath)
    config.resolve.alias[name] = filePath
//    config.module.noParse.push(new RegExp('^' + name + '$'))
    config.module.noParse.push(filePath)
  }

  addVendor('react', path.resolve(node_modules_dir, 'react/dist/react.min.js'))

  if (options.prod) {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}))
    config.plugins.push(new webpack.DefinePlugin({"process.env": {NODE_ENV: JSON.stringify("production")}}))
  }
  
  if (options.dev) {
    config.entry.app.unshift('webpack/hot/dev-server')

    config.plugins.unshift(new webpack.HotModuleReplacementPlugin())
  }
  
  console.log(JSON.stringify(options))
  console.log(JSON.stringify(config))

  return config
}
