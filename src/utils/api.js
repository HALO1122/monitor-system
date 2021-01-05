import { axiosConfig } from './request';
import store from '../store'

// 登录接口
export function RoomLogin (config) {
    let Obj = {
        url: '/schedule/session/3163/monitor_room_login/',
        method: 'post'
    }
    return axiosConfig(Object.assign({}, Obj, config))
}

// 监考拍照
export function saveProctorPhoto (config) {
    let Obj = {
        url: '/schedule/session/3163/room/'+`${store.state.global.roomId}`+
            '/monitor_room_photo/',
        method: 'post'
    }

    return axiosConfig(Object.assign({}, Obj, config))
}

// 获取分班信息
export function getMonitorRoom (config) {
    let Obj = {
        url: '/schedule/session/3163/room/'+`${store.state.global.roomId}`+
            '/teacher/'+`${store.state.global.teacherId}`+'/monitor_room/',
        method: 'GET'
    }
    return axiosConfig(Object.assign({}, Obj, config))
}
