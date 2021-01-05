module.exports = {
    devServer: {
        proxy: "http://172.16.21.35:8001/"
        // proxy: {
        //     '/api':{
        //         target: "http://172.16.21.35:8001/",
        //         changeOrigin: true, // needed for virtual hosted sites
        //         ws: false, // proxy websockets
        //     },
        //     '/socket.io': {
        //         target: "https://peer7.eztest.org:8888",
        //         ws: true,
        //         changeOrigin: true
        //     },
        //     'sockjs-node': {
        //       target: 'https://peer7.eztest.org:8888',
        //       ws: false,
        //       changeOrigin: true
        //     },
        // }
    },
    // 生成环境禁用eslint-loader
    lintOnSave: process.env.NODE_ENV !== 'production'
}