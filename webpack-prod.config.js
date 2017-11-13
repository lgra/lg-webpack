var path = require("path")
var makeWebPackConfig = require('./scripts/webpack-make-config')
var commonOptions = require('./webpack.common.options')

module.exports = makeWebPackConfig(Object.assign(commonOptions, {
  mode: "prod"
}))
