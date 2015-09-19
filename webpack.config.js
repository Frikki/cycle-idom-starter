var Extract = require('extract-text-webpack-plugin');
var Webpack = require("webpack");
var path = require('path');

var webpackConfig = {
  entry: './src/app.js',

  output: {
    filename: 'app.js',
    path: path.resolve('./dist/')
  },

  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/},
      { test: /\.styl$/, loader: Extract.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!autoprefixer-loader!stylus-loader') }
    ]
  },

  resolveLoader: {
    modulesDirectories: [
      path.resolve('./node_modules')
    ]
  },

  plugins: [
    new Extract('styles.css', {allChunks: true})
  ]
};

module.exports = webpackConfig;
