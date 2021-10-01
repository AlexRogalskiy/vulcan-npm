const merge = require("webpack-merge");
const path = require("path");
const commonConfig = require("./webpack.config.base.common.prod");
// @see https://webpack.js.org/guides/typescript/
module.exports = merge(commonConfig, {
  entry: "server/index.ts",
  // Having an entry file would be nice but doesn't work, because you cannot rename the output declaration files (.d.ts)
  // @see https://stackoverflow.com/questions/69403209/output-filename-with-ts-loader-do-not-rename-the-declaration-files
  //entry: "./index.server.ts",
  target: "node",
  output: {
    // @see https://stackoverflow.com/questions/69403209/output-filename-with-ts-loader-do-not-rename-the-declaration-files
    // filename: "server.js",
  },
  resolve: {
    mainFiles: ["index.server.ts", "index.server.js", "index.ts", "index.js"],
  },
});
