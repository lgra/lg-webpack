var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var config_src = process.argv.length > 2 ? process.argv[2] : "../webpack-dev.config"
var config = require(config_src)

var devServerUrl = config.devServerUrl
delete config.devServerUrl


new WebpackDevServer(webpack(config), {
  contentBase: config.output.path,
  publicPath: config.output.publicPath || "/",
  hot: true,
  bonjour: true,
  stats: { colors: true },
  headers: { 'Access-Control-Allow-Origin': '*' }, // to allow CORS
  historyApiFallback: config.output.publicPath && config.output.publicPath !== "/" ? { index: config.output.publicPath + 'index.html' } : true, // to be compatible with browser history in dev mode
  disableHostCheck: true // to allow access from another machine
}).listen(devServerUrl.port, devServerUrl.listenTo,
  function (err, result) {
    if (err) {
      console.log(err)
    }
    console.log('Listening at ' + devServerUrl.listenTo + ':' + devServerUrl.port)
  })

// open the app !
require("opn")(devServerUrl.url + (config.output.publicPath || "/"))
