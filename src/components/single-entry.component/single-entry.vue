<template>
    <div class="single-entry" ref="singleLi">
        <span class="video-loading-wrap"></span>
        <div class="video-entry-content">
            <p class="video-tag-tip">
                <i class="ez-icon-font icon-monitor">&#xe73e;</i><span class="icon-monitor">{{item.videoStatus}}</span>
                <i v-show="item.pinup" class="ez-icon-font txt-24px icon-dingzhu">&#xe80d;</i>
                <i v-show="item.openSound" class="ez-icon-font txt-24px icon-yuyin">&#xe80e;</i>
            </p>
            <p class="tag-abnormal" v-show="item.monitor_photo_count">{{ $t('monitor.abnormal') }}</p>
            <img class="entry-picture mb5" v-show="!item.isVideo" ref="entry_img" :src="item.photo_url">
            <video :id="item.permit" v-show="item.isVideo" ref="entry_video" muted autoplay playsinline></video>
        </div>
        <!-- icon 事件 -->
        <p class="icon-event-content">
            <i class="ez-icon-font txt-18px" @click="pingVideo(item)">&#xe804;</i>
            <i v-if="item.audio_monitor" @click="controlSound(item, $event)" class="ez-icon-font txt-18px" v-html="sound"></i>
            <i v-if="openVideo" @click="openCallVideo(item)" class="ez-icon-font txt-18px">&#xe66c;</i>
            <i class="ez-icon-font txt-18px" @click="sendMessage(item)">&#xe63b;</i>
            <i class="ez-icon-font txt-18px" @click="screenshotCut(item)">&#xe807;</i>
            <i v-if="openForceExam" class="ez-icon-font txt-18px" @click="forceExam(item)">&#xe71e;</i>
        </p>
        <div class="entry-event-block" v-if="!item.eagle_eye">
            <p class="double-video" v-if="doubleVideo" @click="togglesEventBlock(item, 'one')"></p>
            <entry-log :entryLog="item" ref="_entryLog"></entry-log>
        </div>
        <div class="eagle-event-block" v-if="item.eagle_eye">
            <p class="single-video" @click="togglesEventBlock(item, 'two')"></p>
            <eagle-log :eagleLog="item" ref="_eagleLog" :peers="peers" :to_peers="to_peers"></eagle-log>
        </div>
        <div class="entry-information">
            <p><span>{{item.permit}} | {{item.full_name}}</span>
                <span class="icon-num">
                    <span><i class="ez-icon-font">&#xe81f;</i>{{item.machine_photo_count}}</span>
                    <span><i class="ez-icon-font">&#xe807;</i>{{item.error_screen_photo_count}}</span>
                </span></p>
            <p class="exam">
                <span class="exam-answer">{{ $t('monitor.time_spent') }}{{item.time_spent}}</span>
                <span class="exam-complete">{{ $t('monitor.answered') }}{{item.answered_num}} / {{item.item_num}}{{ $t('monitor.question') }}</span>
            </p>
        </div>

        <sendMessage v-if="sendMsgData.openMessageModal" :sendMsgData="sendMsgData" :eagle_eye="eagle"></sendMessage>
        <screenshot v-if="screenshotData.openScreenshotModal" :screenshotData="screenshotData"></screenshot>
        <sendVideo  v-if="callVideoData.openVideoCallModal" :callVideoData="callVideoData" ></sendVideo>
    </div>
</template>

<script>
import entryLog from '@/components/entry-log.component/entry-log';
import eagleLog from '@/components/eagle-log.component/eagle-log';
import sendMessage from '@/components/send-message.component/send-message';
import screenshot from '@/components/screenshot.component/screenshot';
import sendVideo from '@/components/send-video.component/send-video';
import Bus from '@/utils/bus.js';
import { forcedExam } from '@/utils/api.js'
// 
const Peer = require('simple-peer');
export default {
    data() {
        return{
            peers: {},
            to_peers: {},
            sound: '&#xe806;',
            sendMsgData: {},
            screenshotData: {},
            callVideoData: {},
            destroyPeer: null
        }
    },
    sockets: {
        message(data) {
            // console.log(data, 'this.sockets----------------message')
            switch (data.type) {
                case "signal_called":
                    var peer = this.peers[data.to_peer];
                    this.to_peers[data.to_peer] = data.from_peer;
                    if ( peer !== null && peer != undefined){
                        peer.signal(data.msg);
                    }
                    break;
                case "signal":
                    var peer = this.peers[data.to_peer];
                    this.to_peers[data.to_peer] = data.from_peer;
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
                    this.forceExamSucess(data);
                    break;
                case "force_end_exam_fail":
                    this.forceExamFail(data);
                    break;
            }
        }
    },
    components: {
        entryLog, eagleLog, sendMessage, screenshot, sendVideo
    },
    props: {
        item: {
            type: Object,
            dafault: {}
        },
        openVideo: {
            type: Boolean,
            dafault: false
        },
        openForceExam: {
            type: Boolean,
            dafault: false
        },
        doubleVideo: {
            type: Boolean,
            dafault: false   
        },
        eagle: {
            type: Boolean,
            dafault: false
        }
    },
    mounted() {
        this.connect(this.item, this.$refs); 
    },
    computed: {

    },
    destroyed() {
        this.destroyPeer.destroy();
    },
    methods: {
        // 钉住考生
        pingVideo(item, e) {
            if (item.pinup) {
                item.pinup = false;
            } else {
                item.pinup = true;
            }
        },
        // 控制考生声音
        controlSound(item, e) {
            let video = this.$refs.entry_video;
            item.openSound = !item.openSound;
            if (item.openSound) {
                video.muted = false;
                this.sound = '&#xe805;';
            } else {
                video.muted = true;
                this.sound = '&#xe806;';
            }
        },
        // 监考发送消息
        sendMessage(item) {
            item.openMessageModal = true;
            this.sendMsgData = item;
            Bus.$emit('busTimerPause', {"status": false} );
        },
        // 监考截屏
        screenshotCut(item) {
            let _entryVideos = this.$refs.entry_video;
            item.openScreenshotModal = true;
            this.screenshotData = item;
            Bus.$emit('controlMainScreenshot', { "permit": item.permit, "video": _entryVideos});
            Bus.$emit('busTimerPause', { "status": false} );
        },
        // 视频通话
        openCallVideo(item, e) {
            console.log(this.$refs._eagleLog.$refs.eagle_video, 'this.$refs')
            let video = this.$refs.entry_video,
                eagleVideo = this.$refs._eagleLog;

            item.studentStream = video.srcObject;
            if (eagleVideo != undefined && item.eagle_eye) {
                console.log(eagleVideo.$refs.eagle_video, 'eagleVideo.$refs.eagle_video')
                item.eagleStream = eagleVideo.$refs.eagle_video.srcObject;
            }
            item.openVideoCallModal = true;
            this.callVideoData = item;
            Bus.$emit('busTimerPause', {"status": false} );
        },
        // 强制收卷
        forceExam(item) {
            console.log(item)
            let	pkt = {
                type: "force_end_exam",
                to: item.socket_id,
                from: this.$socket.id,
                msg: ''
            }
            forcedExam({ data: {"permit": item.permit} }).then((res)=> {
                if(res.code == 200) {
                    that.$socket.emit("message", pkt)
                    this.forceExamSucess({"permit": endExamPermit})
                }
            }).catch((xhr) => {
                let data = {"msg": "考生强制收卷失败,请稍后重试！"}
                this.forceExamFail(data);
            })
        },
        forceExamSucess(data) {
            console.log(data, 'forceExamSucess')
        },
        forceExamFail(data) {
            console.log(data, 'forceExamFail')
        },
        togglesEventBlock(item, toggles) {
            toggles == 'one' ? item.eagle_eye = true : item.eagle_eye = false;
        },
        connect(res, refs) {
            let that = this, peer = new Peer();
            that.peers[peer._id] = peer;
            that.destroyPeer = peer;

            peer.on('signal', function (data) {
                var pkt = {
                    type: "signal",
                    to: res.socket_id,
                    from_peer: peer._id,
                    to_peer: that.to_peers[peer._id],
                    msg: data
                }
                that.$socket.emit("message", pkt);
            });

            peer.on('connect', function() {
                console.log('peer------------------connect');
            });

            peer.on('stream', function(stream) {
                refs.entry_video.srcObject = stream;
                // $(refs.singleLi).attr("peer_id", peer._id);
                res.isVideo = true;
                res.videoStatus = that.$t('monitor.running');
                console.log(stream,'stream available: ');
            });
            peer.on('data', function(data) {
                console.log('data available');
            });
            peer.on('close', function() {
                res.isVideo = false;
                res.videoStatus = that.$t('monitor.disconnect');
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
            that.$socket.emit("message", pkt)
        }
    }
}
</script>

<style scoped lang="scss">
@import './single-entry.scss';
</style>