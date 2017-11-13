var path = require("path")
var projectRoot = process.cwd()

var options = {
  // the main entry file of the app
  entry: path.resolve(__dirname, 'app/main.jsx'),
  // the directory where to build the app
  dest: path.resolve(__dirname, 'build'),
  // optionnal: a path string or an array of path string
  subModuleDir: path.resolve(projectRoot, 'vr-ui/web_modules'),
  // optionnal: a map of alternative file or directory, applied to WebPack loader and PostCss.import.
  // See webpack.resolve.alias for documentation
  alias: {
    '_shared/colors/controls.css': path.resolve(projectRoot, 'vr-ui/web_modules/_shared/colors/controls-legacy.css')
  }
}

module.exports = options
