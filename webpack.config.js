const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 模式配置
  mode: 'development', // 也可以是 'production' 或 'none'

  // 入口文件配置
  entry: {
    index: './src/index.js',
    login: './src/login.js',
    signup: './src/signup.js',
    app: './src/app.js'
  },

  // 输出文件配置
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: 'assets/[ext]/[name][hash][ext][query]',
    clean: true, // 清理 /dist 文件夹
  },

  // 模块加载规则
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][hash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][hash][ext]'
        }
      },
      {
        test: /\.(csv|tsv)$/i,
        use: ['csv-loader'],
        generator: {
          filename: 'assets/csv/[name][hash][ext]'
        }
      },
      {
        test: /\.xml$/i,
        use: ['xml-loader'],
        generator: {
          filename: 'assets/xml/[name][hash][ext]'
        }
      },
    ],
  },

  // 插件配置
  plugins: [
    new HtmlWebpackPlugin({
      // title: 'name',
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      template: './src/login.html',
      filename: 'login.html',
      chunks: ['login']
    }),
    new HtmlWebpackPlugin({
      template: './src/signup.html',
      filename: 'signup.html',
      chunks: ['signup']
    }),
    new HtmlWebpackPlugin({
      template: './src/app.html',
      filename: 'app.html',
      chunks: ['app']
    })
  ],

  devServer: {
    static: path.resolve(__dirname, 'dist'),
    hot: true,
    compress: true,
    port: 6420,
    watchFiles: ['src/**/*.php', 'src/**/*.html', 'public/**/*'],
  },

};