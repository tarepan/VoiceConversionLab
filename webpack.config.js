const path = require("path");

module.exports = {
  mode: "development",
  target: "node",
  entry: {
    testAction: "./src/testAction.js",
    TweetAction: "./src/TweetAction.ts"
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx"]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 8000
  }
};
