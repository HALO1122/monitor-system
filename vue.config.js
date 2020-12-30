module.exports = {
    devServer: {
        // 172.16.21.98
        proxy: 'http://172.16.21.98:8010/'
    },
    // 生成环境禁用eslint-loader
    lintOnSave: process.env.NODE_ENV !== 'production',
    configureWebpack: {
        // plugins: [
        //   new MyAwesomeWebpackPlugin()
        // ]
    },

}