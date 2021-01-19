import Vue from 'vue';
import store from '@/store';
import self from '@/main';
import vueSocketIo from "vue-socket.io";
import $ from 'jquery';
import { saveProctorSocketId } from '@/utils/api.js'
    
const Peer = require('simple-peer'),
    peers = {}, to_peers = {};

export function openSocket(res) {
    Vue.use(
        new vueSocketIo({
            debug: false,
            connection: res.peer_setting.singal_server,
        })
    );
    const Role = `${store.state.global.role}`;
    // 监听 socket
    self.sockets.subscribe('message', data => {
        // console.log('message received', data)
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
    console.log(refs, 'refs')
    var peer = new Peer();
    peers[peer._id] = peer;

    if (action == 'all') {
        i = i;
    } else if(action == 'next') {
        i = refs.curLi.length - 1;
    } else if(action == 'prev') {
        i = 0;
    }
    peer.on('signal', function (data) {
        var pkt = {
            type: "signal",
            to: res.socket_id,
            from_peer: peer._id,
            to_peer: to_peers[peer._id],
            msg: data
        }
        // console.log(pkt, 'pkt')
        self.$socket.emit("message", pkt);
    });

    peer.on('connect', function() {
        console.log('peer------------------connect');
    });

    peer.on('stream', function(stream) {
        refs.entry_video[i].srcObject = stream;
        $(refs.curLi[i]).attr("peer_id", peer._id);
        res.isVideo = true;
        console.log(stream,'stream available: ');
    });
    peer.on('data', function(data) {
        console.log('data available');
    });
    peer.on('close', function() {
        res.isVideo = false;
        console.log(res, 'peer------------------closed');
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

export function destroyPeer(removeLi, type) {
    // if (type != 'call') {
    //     $(removeLi).remove();
    // }
    if ($(removeLi).attr("peer_id") != undefined && $(removeLi).attr("peer_id") !=  "") { peers[$(removeLi).attr("peer_id")].destroy(); }
    if ($(removeLi).attr("eagle_peer_id") != undefined && $(removeLi).attr("eagle_peer_id") !=  "") { peers[$(removeLi).attr("eagle_peer_id")].destroy(); }
    delete peers[$(removeLi).attr("peer_id")];
    delete peers[$(removeLi).attr("eagle_peer_id")];
    delete to_peers[$(removeLi).attr("peer_id")];
}
