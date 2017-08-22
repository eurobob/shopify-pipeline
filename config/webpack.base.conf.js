const webpack = require('webpack')
const config = require('../config')
const WriteFileWebpackPlugin = require('write-file-webpack-plugin')
const SvgStore = require('webpack-svgstore-plugin')
const paths = require('../config/paths')

const isDevServer = process.argv.find(v => v.includes('serve'))

// Given a request path, return a function that accepts a context and modify it's request.
const replaceCtxRequest = request => context => Object.assign(context, { request })

module.exports = {
  context: paths.src,

  entry: config.paths.entrypoints,

  output: {
    filename: '[name].[hash].js',
    path: config.paths.assetsOutput
  },

  resolveLoader: {
    modules: ['node_modules', config.paths.lib]
  },

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          configFile: config.paths.eslintrc
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            ['env', {
              targets: {
                browsers: ['last 2 versions', 'safari >= 7']
              },
              modules: false
            }]
          ]
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'hmr-alamo-loader'
      },
      {
        test: /fonts\/.*\.(eot|svg|ttf|woff|woff2)$/,
        exclude: /node_modules/,
        loader: 'file-loader'
      },
      {
        test: config.regex.images,
        exclude: /node_modules/,
        use: [
          { loader: 'file-loader', options: { name: '[name].[hash].[ext]' } },
          { loader: 'img-loader' }
        ]
      },
      {
        test: config.regex.static,
        // excluding layout/theme.liquid as it's also being emitted by the HtmlWebpackPlugin
        exclude: /(node_modules|layout\/theme\.liquid)/,
        loader: 'file-loader',
        options: {
          name: '../[path][name].[ext]'
        }
      },
      {
        test: /layout\/theme\.liquid$/,
        exclude: /node_modules/,
        loader: 'raw-loader'
      },
      {
        test: /\.liquid$/,
        exclude: /node_modules/,
        loader: `extract-loader!liquid-loader?dev-server=${isDevServer ? 'true' : 'false'}`
      }
    ]
  },

  plugins: [
    // https://webpack.js.org/plugins/context-replacement-plugin/#newcontentcallback
    new webpack.ContextReplacementPlugin(/__appsrc__/, replaceCtxRequest(paths.src)),
    new webpack.ContextReplacementPlugin(/__appvendors__/, replaceCtxRequest(paths.vendors)),

    new WriteFileWebpackPlugin({
      test: config.regex.images,
      useHashIndex: true,
      log: false
    }),

    new WriteFileWebpackPlugin({
      test: /^(?:(?!hot-update.json$).)*\.(liquid|json)$/,
      useHashIndex: true,
      log: false
    }),

    new SvgStore({
      svgoOptions: {
        plugins: [
          { removeTitle: true }
        ]
      }
    })
  ]
}
