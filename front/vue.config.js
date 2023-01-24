const { defineConfig } = require("@vue/cli-service");
const Dotenv = require('dotenv-webpack');

module.exports = defineConfig({
    transpileDependencies: true,
    publicPath: process.env.NODE_ENV === "production" ? "/app" : "/",
    configureWebpack: {
        plugins: [
          new Dotenv()
        ]
      }
});

