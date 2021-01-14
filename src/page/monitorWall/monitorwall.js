import Vue from 'vue';
import store from '@/store';
import self from '@/main';
import vueSocketIo from "vue-socket.io";
import {entry_list} from './monitorwall';
import { saveProctorSocketId } from '@/utils/api.js'
    
const Peer = require('simple-peer'),
    peers = {},
    to_peers = {};

export function openSocket(res) {
    Vue.use(
        new vueSocketIo({
            debug: false,
            connection: res.peer_setting.singal_server,
        })
    );
    const Role = `${store.state.global.role}`;
    console.log(entry_list, 'that*****************')
    // 监听 socket
    self.sockets.subscribe('message', data => {
        console.log('message received', data)
        switch (data.type) {
            case "signal_called":
                var peer = peers[data.to_peer];
                to_peers[data.to_peer] = data.from_peer;
                if ( peer !== null && peer != undefined){
                    peer.signal(data.msg);
                }
                break;
            case "signal":
                var peer = peers[data.to_peer];
                to_peers[data.to_peer] = data.from_peer;
                if ( peer !== null && peer != undefined){
                    peer.signal(data.msg);
                }
                break;
            case "call":
                // getLocalStream("", function(){
                //     const Tpeer = callConnect(data.from, data.from_peer);
                //     if ( Tpeer !== null && Tpeer != undefined) {
                //         peers[Tpeer._id] = Tpeer;
                //     }
                // });
                break;
            case "student_info":
                let time = new Date(),
                    h = (time.getHours() < 10 ? '0'+time.getHours() : time.getHours()) + ':',
                    m = (time.getMinutes() < 10 ? '0'+time.getMinutes() : time.getMinutes());
                data.time = h+m;
                // completeHandup(data);
                break;
            case "student_cancel_handup":
                // cancelHandup(data);
                break;
            case "force_end_exam_sucess":
                // endExamSucess(data);
                break;
            case "force_end_exam_fail":
                // endExamFail(data);
                break;
        }
    })
    // 连接socket & 保存监考老师socketId
    self.$socket.on("connect", function () {
        console.log(self.$socket,'socket---connect')

        let msg = {"teacher_socket": self.$socket.id};
        if (Role == 'proctor') {
            saveProctorSocketId({ data: msg }).then(res => { }).catch(err => { console.log(err)  })
        }
    });
}

export function connect(res, action, i, refs) {
    console.log(res,action, i, refs,'event')
    let peer = new Peer();
    peers[peer._id] = peer;

    peer.on('signal', function (data) {
        var pkt = {
            type: "signal",
            to: res.socket_id,
            from_peer: peer._id,
            to_peer: to_peers[peer._id],
            msg: data
        }
        console.log(pkt, 'pkt')
        self.$socket.emit("message", pkt);
    });

    peer.on('connect', function() {
        console.log('peer------------------connect');
    });

    peer.on('stream', function(stream) {
        refs.entry_video[i].srcObject = stream;
        res.isVideo = true;
        console.log(stream,'stream available: ');
    });
    peer.on('data', function(data) {
        console.log('data available');
    });
    peer.on('close', function() {
        res.isVideo = false;
        console.log(res, 'res')
        console.log('peer------------------closed');
    });
    peer.on('error', function(error) {
        console.log('error: ',error);
    });
    // make the call
    var pkt = {
        type: "call",
        to: res.socket_id,
        from_peer: peer._id
    }
    console.log(pkt, 'pkt')
    self.$socket.emit("message", pkt)
}
