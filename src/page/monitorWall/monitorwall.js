import Vue from 'vue'
import socketIo from "vue-socket.io";


export function openSocket(res) {
    Vue.use(
        new socketIo({
            debug: true,
            // connection: io(res.peer_setting.singal_server, options),
            connection: res.peer_setting.singal_server,
        })
    );
}

function initStudentVideo(res) {
    console.log(res)

}
