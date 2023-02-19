import path from "node:path";
import url from "node:url";
 const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default {
  mode: "development",
  target: "node",
  entry: {
    PullShareAction: "./src/PullShareAction.ts",
    ConfirmationAction: "./src/ConfirmationAction.ts",
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx"],
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
    alias: {
      "universal-user-agent": path.resolve(
        __dirname,
        "node_modules/universal-user-agent/dist-node/index.js"
      ),
    },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 8000,
  },
};
