const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv === "production";
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const plugins = [
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify(nodeEnv),
    },
  }),
  new HtmlWebpackPlugin({
    title: "Frontend Wars - Piotr Żmuda",
    template: "!!ejs-loader!src/index.html",
  }),
  new MiniCssExtractPlugin({
    filename: "styles.css",
    chunkFilename: "styles.css",
  }),
  new webpack.LoaderOptionsPlugin({
    options: {
      tslint: {
        emitErrors: true,
        failOnHint: true,
      },
    },
  }),
];

var config = {
  devtool: isProd ? "hidden-source-map" : "source-map",
  context: path.resolve("./src"),
  entry: {
    app: "./index.ts",
    game: "./game.ts",
  },
  output: {
    path: path.resolve("./dist"),
    filename: "[name].bundle.js",
  },
  resolve: {
    extensions: [".ts", ".js", ".html", ".jsx", ".tsx", ".css"],
    modules: ["node_modules"],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.tsx?$/,
        exclude: [/\/node_modules\//],
        use: ["awesome-typescript-loader", "source-map-loader"],
      },
      !isProd
        ? {
            test: /\.(js|ts)$/,
            loader: "istanbul-instrumenter-loader",
            exclude: [/\/node_modules\//],
            query: {
              esModules: true,
            },
          }
        : null,
      { test: /\.html$/, loader: "html-loader?exportAsEs6Default" },
      {
        test: /\.(png|jpg|gif|svg|ico|pdf)$/,
        loader: "file-loader",
        query: {
          outputPath: "./assets/",
          name: "[name].[ext]",
          esModule: false,
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ].filter(Boolean),
  },
  plugins: plugins,
  devServer: {
    contentBase: path.join(__dirname, "dist/"),
    compress: true,
    port: 3005,
    hot: true,
  },
};

module.exports = config;
