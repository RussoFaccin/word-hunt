var path = require("path");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const libraryName = "WordHunt";

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist/js"),
    publicPath: "js/",
    filename: `${libraryName}.min.js`,
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin({ minimize: true })
  ],
  devServer: {
    contentBase: path.join(__dirname, "/dist/"),
    compress: true,
    inline: true,
    port: 9000
  }

}
