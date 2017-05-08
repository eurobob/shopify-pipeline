/* eslint-disable */
const fs = require('fs');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const paths = require('../config/paths');
const webpackConfig = require('../config/webpack.dev.conf');
const shopify = require('../lib/shopify-deploy');
const config = require('../config');

const compiler = webpack(webpackConfig);
const server = new WebpackDevServer(compiler, {
  contentBase: paths.dist,
  hot: true,
  https: true,
  headers: {
    'Access-Control-Allow-Origin': `https://${config.shopify.development.store}`,
  },
  stats: 'errors-only',
});

compiler.plugin('done', (stats) => {
  let files = [];

  Object.keys(stats.compilation.assets).forEach((key) => {
    const asset = stats.compilation.assets[key];

    if (asset.emitted) {
      // webpack-dev-server doesn't write assets to disk, see webpack.base.conf.js
      // where we use WriteFileWebpackPlugin to write certain assets to disk
      // (the ones to be uploaded) (the others are served from memory)
      if (fs.existsSync(asset.existsAt)) {
        files = [...files, asset.existsAt.replace(paths.dist, '')];
      }
    }
  });

  shopify.sync({ upload: files });
});

server.listen(config.port);
