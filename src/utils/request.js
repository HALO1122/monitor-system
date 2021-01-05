import service from './config';

export function axiosConfig(config) {
    let Obj = {
        method: config.method.toUpperCase() || 'POST',
        url: config.url,
        data: config.data
    }


    return service(Obj).then((res) => {
        return Promise.resolve(res)
    }).catch((error) => {
        return Promise.reject(error)
    })
}
