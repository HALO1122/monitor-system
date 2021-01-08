
const webpack = require('webpack')

module.exports = {
    devServer: {
        proxy: "http://172.16.21.35:8001/"
    },
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                jQuery: 'jquery',
                $: 'jquery'
            })
        ]
    },
    // 生成环境禁用eslint-loader
    lintOnSave: process.env.NODE_ENV !== 'production'
}