const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

plugins: [
  new HtmlWebpackPlugin({
    template: 'public/index.html',  // Шаблон HTML
  }),
],
module.exports = {
  entry: './src/main.js',  // Главный JS-файл
  output: {
    filename: 'bundle.js',  // Имя итогового файла
    path: path.resolve(__dirname, 'build'),  // Папка для сборки
    clean: true,  // Очищать папку перед сборкой
  },
  devtool: 'source-map',  // Генерировать source maps (для отладки)
  plugins: [
    new CopyPlugin({  // Копирует файлы из public в build
      patterns: [{ from: 'public', to: 'build' }],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,  // Применять Babel ко всем JS-файлам
        exclude: /node_modules/,  // Игнорировать node_modules
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],  // Настройки Babel
          },
        },
      },
    ],
  },
  output: {
    filename: 'bundle.[contenthash].js',  // Будет bundle.3a8b7c.js
  },
};