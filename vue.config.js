module.exports = {
  devServer: {
    disableHostCheck: true
  },
   pwa: {
     workboxPluginMode: "InjectManifest",
     workboxOptions: {
       swSrc: "src/service-worker.js"
     }
   }
}
