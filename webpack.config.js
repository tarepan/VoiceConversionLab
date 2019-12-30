const path = require("path");

module.exports = {
  mode: "development",
  target: "node",
  entry: {
    testAction: "./src/testAction.ts",
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
    extensions: [".ts", ".js", ".tsx"],
    alias: {
      "universal-user-agent": path.resolve(
        __dirname,
        "node_modules/universal-user-agent/dist-node/index.js"
      )
    }
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
