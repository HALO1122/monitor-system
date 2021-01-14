import { axiosConfig } from './request';
import store from '../store';

// 登录接口
export function RoomLogin (config) {
    let Obj = {
        url: '/schedule/session/3163/monitor_room_login/',
        method: 'POST'
    }
    return axiosConfig(Object.assign({}, Obj, config))
}

// 监考拍照
export function saveProctorPhoto (config) {
    let Obj = {
        url: '/schedule/session/3163/room/'+`${store.state.global.roomId}`+
            '/monitor_room_photo/',
        method: 'POST'
    }

    return axiosConfig(Object.assign({}, Obj, config))
}

// 获取分班信息
export function getMonitorRoom (config) {
    let Obj = {
        // url: '/schedule/session/3163/room/'+`${store.state.global.roomId}`+
        //     '/teacher/'+`${store.state.global.teacherId}`+'/monitor_room/',
        url: '/schedule/session/3163/room/1119/teacher/235/monitor_room/',
        method: 'GET'
    }
    return axiosConfig(Object.assign({}, Obj, config))
}

// 保存监考的socketid
export function saveProctorSocketId (config) {
    let Obj = {
        url: '/schedule/session/3163/room/'+`${store.state.global.roomId}`+'/teacher_socket/',
        method: 'POST'
    }
    return axiosConfig(Object.assign({}, Obj, config))
}

// 获取单个考生信息
export function getSingleEntry (config) {
    let Obj = {
        url: '/schedule/session/3163/room/'+`${store.state.global.roomId}`+'/single_entry/',
        method: 'POST'
    }
    return axiosConfig(Object.assign({}, Obj, config))
}

// 监考发消息
export function sendEntryMsg (config) {
    let Obj = {
        url: '/schedule/session/3163/room/'+`${store.state.global.roomId}`+'/teacher_message/',
        method: 'POST'
    }
    return axiosConfig(Object.assign({}, Obj, config))
}