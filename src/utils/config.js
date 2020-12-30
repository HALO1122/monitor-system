import axios from 'axios'
import store from '../store'

// 添加请求拦截器
axios.interceptors.request.use(config => {
    let token = store.state.global.token;
    if (token != '') {
        config.headers['AUTHORIZATIONROOM'] = 'Token '+token;
    }
    console.log(token, 'token')

    return config
}, (error) => {
    return Promise.reject(error);
})

// 添加响应拦截器
axios.interceptors.response.use(
    res => {  //成功请求到数据
        return Promise.resolve(res.data)
    },
    error => {  //响应错误处理
        console.log(error)
    }
);

export default axios;
