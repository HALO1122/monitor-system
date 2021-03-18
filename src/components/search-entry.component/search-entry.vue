<template>
    <div class="search-model" >
        <div class="room-video-li" ref="search_block">
                <!-- <span class="video-loading-wrap">{{$t('monitor.loading')}}</span> -->
                <div class="control-close">
                    <i class="ez-icon-font txt-24px" @click="searchModelClose()">&#xe63b;</i>
                </div>
                <div class="video-entry-content">
                    <p class="video-tag-tip">
                        <i class="ez-icon-font icon-monitor">&#xe73e;</i><span class="icon-monitor">运行中</span>
                        <i v-show="search_entry_data[0].openSound" class="ez-icon-font txt-24px icon-yuyin">&#xe80e;</i>
                    </p>
                    <p class="tag-abnormal" v-show="search_entry_data[0].monitor_photo_count">{{ $t('monitor.abnormal') }}</p>
                    <img class="entry-picture mb5" v-show="!search_entry_data[0].isVideo" ref="entry_img" :src="search_entry_data[0].photo_url">
                    <video :id="search_entry_data[0].permit" v-show="search_entry_data[0].isVideo" ref="entry_video" muted autoplay playsinline></video>
                </div>
                <p class="icon-event-content">
                    <i class="ez-icon-font txt-18px" @click="pingVideo(search_entry_data[0])">&#xe804;</i>
                    <i v-if="search_entry_data[0].audio_monitor" @click="controlSound(search_entry_data[0], $event)" class="ez-icon-font txt-18px" v-html="sound"></i>
                    <!-- <i v-if="openVideo" @click="openVideo(search_entry_data[0])" class="ez-icon-font txt-18px">&#xe66c;</i> -->
                    <i class="ez-icon-font txt-18px" @click="sendMessage(search_entry_data[0])">&#xe63b;</i>
                    <i class="ez-icon-font txt-18px" @click="screenshotCut(search_entry_data[0])">&#xe807;</i>
                </p>
                <div class="entry-event-block" v-if="!room_info.eagle_eye">
                    <!-- <p class="double-video" v-if="doubleVideo" @click="togglesEventBlock(search_entry_data[0], 'one')"></p> -->
                    <entry-log :entryLog="search_entry_data[0]" ref="_entryLog"></entry-log>
                </div>
                <div class="eagle-event-block" v-if="room_info.eagle_eye">
                    <p class="single-video" @click="togglesEventBlock(search_entry_data[0], 'two')"></p>
                    <eagle-log :eagleLog="search_entry_data[0]" ref="_eagleLog" :peers="peers" :to_peers="to_peers"></eagle-log>
                </div>
                <div class="entry-information">
                    <p><span>{{search_entry_data[0].permit}} | {{search_entry_data[0].full_name}}</span>
                        <span class="icon-num">
                            <span><i class="ez-icon-font">&#xe81f;</i>{{search_entry_data[0].machine_photo_count}}</span>
                            <span><i class="ez-icon-font">&#xe807;</i>{{search_entry_data[0].error_screen_photo_count}}</span>
                        </span></p>
                    <p class="exam">
                        <span class="exam-answer">{{ $t('monitor.time_spent') }}{{search_entry_data[0].time_spent}}</span>
                        <span class="exam-complete">{{ $t('monitor.answered') }}{{search_entry_data[0].answered_num}} / {{search_entry_data[0].item_num}}{{ $t('monitor.question') }}</span>
                    </p>
                </div>
        </div>
        <send-message v-if="sendMsgData.openMessageModal" :sendMsgData="search_entry_data[0]" :timerPause="timerPause" :eagle_eye="room_info.eagle_eye"
            @_timerPause="timerPause = true"></send-message>
        <screenshot v-show="screenshotData.openScreenshotModal" :screenshotData="search_entry_data[0]" :timerPause="timerPause" ref="screenshot"
            @_timerPause="timerPause = true"></screenshot>
    </div>
</template>

<script>
import { getMonitorRoom, getSingleEntry, searchSingleEntry, saveProctorSocketId } from '@/utils/api.js'
import entryLog from '@/components/entry-log.component/entry-log'
import eagleLog from '@/components/eagle-log.component/eagle-log'
import sendMessage from '@/components/send-message.component/send-message'
import screenshot from '@/components/screenshot.component/screenshot'
const Peer = require('simple-peer');
export default {
    data() {
        return{
            peers: {},
            to_peers: {},
            sendMsgData: {},
            screenshotData: {},
            timerPause: true
        }
    },
    components: {
        entryLog, eagleLog,sendMessage,screenshot
    },
    props: {
        search_entry_data: {
            type: Array,
            dafault: []
        },
        room_info:{
            type: Object,
            dafault: {}
        }
    },
    
    mounted() {
        this.initSingleVideo(this.search_entry_data[0].permit)
    },
    destroyed() {
        this.destroyPeer();
    },
    sockets: {
        message(data) {
            // console.log(data, 'this.sockets**************message')
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
                    // endExamSucess(data);
                    break;
                case "force_end_exam_fail":
                    // endExamFail(data);
                    break;
            }
        }
    },
    methods: {

        openVideo() {

        },
        async initSingleVideo(permit) {
            let msg = {"permit": permit},
                that = this;
            await getSingleEntry({ data: msg }).then(res => {
                if (res.code == 200) {
                    this.connect(res.data, that.$refs);
                    res.data.eagle_eye = that.room_info.eagle_eye;
                    res.data.audio_monitor = that.room_info.audio_monitor;
                    res.data.isVideo = false;
                    res.data.pinup = false;
                    res.data.openSound = false;
                    res.data.openMessageModal = false;
                    res.data.openScreenshotModal = false;
                    // that.removeEntry(action, that.entryInfo);
                    console.log('-----searchInit------');
                }
            })
        },
        destroyPeer() {
            for (const key in this.peers) {
                delete this.peers[key]
            }
            for (const key in this.to_peers) {
                delete this.peers[key]
            }
        },
        searchModelClose() {
            this.$emit('searchModelClose',false)
        },
         // 监考发送消息
        sendMessage(item) {
            item.openMessageModal = true;
            this.sendMsgData = item;
            this.timerPause = false;
            console.log(this.search_entry_data[0]);
        },
        // 监考截屏
        screenshotCut(item) {
            item.openScreenshotModal = true;
            this.screenshotData = item;
            this.timerPause = false;
            let _entryVideos = this.$refs.entry_video,
                screenshotModal = this.$refs.screenshot;
            for (let i = 0, len = _entryVideos.length; i < len; i++) {
                if ($(_entryVideos[i]).attr("id") == item.permit) {
                    screenshotModal.getVideo(_entryVideos[i])
                }
            }
        },
        connect(res, refs) {
            let that = this, peer = new Peer();
            that.peers[peer._id] = peer;
            console.log(that.peers,that.to_peers);
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
                $(refs.search_block).attr("peer_id", peer._id);
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
            that.$socket.emit("message", pkt)
        }
    },
}
</script>

<style scoped lang="scss">
    .search-model {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        overflow-y: hidden;
        z-index: 99;

        .control-close {
            position: fixed;
            top: 0;
            right: 16px;
            width: 40px;
            color: #fff;
            font-size: 32px;
        }

        .room-video-li { 
            position: relative; 
            display: block;
            width: 420px;
            margin: 40px 40%;
            color: #ffffff;
            .video-entry-content{
                height: 315px;
                border-top-left-radius: 16px;
                border-top-right-radius: 16px;
                background-color: #3D3C41;
                width: 100%;
                img {width: 100%;}
                video{
                    width: 100%;
                    height: 315px;
                    border-top-left-radius: 16px;
                    border-top-right-radius: 16px;
                }
                .video-tag-tip{
                    position: absolute;
                    left: 12px;
                    top: 10px;
                    i{ margin: 0px 6px; }
                    .icon-monitor{ color: #FF5252 !important; }
                    .icon-dingzhu { color: #4D84FF; }
                    .icon-yuyin { color: #00CF71; }
                }
                .tag-abnormal{
                    background: #BF1E1E;
                    border-radius: 15px;
                    padding: 2px 8px;
                    font-size: 12px;
                    position: absolute;
                    top: 10px;
                    right: 12px;
                }
            }
            .icon-event-content{
                background-color: #4C4E52;
                margin: 0px;
                padding: 8px 5px;
                text-align: left;
                i{ margin: 0px 6px; }
            }
            @mixin toggle-video{
                cursor: pointer;
                position: absolute;
                top: 180px;
                width: 0;
                height: 0;
                z-index: 99;
            }
            @mixin icon-spot{
                height: 96px;
                padding: 0px 30px;
                background: url(../../assets/images/icon-spot.png) 0 2px no-repeat;
                background-position: 12px 5px;
        }
        .icon-event-content{
            background-color: #4C4E52;
            margin: 0px;
            padding: 8px 5px;
            text-align: left;
            i{ margin: 0px 6px; }
        }
        @mixin toggle-video{
            cursor: pointer;
            position: absolute;
            top: 180px;
            width: 0;
            height: 0;
            z-index: 99;
        }
        @mixin icon-spot{
            height: 96px;
            padding: 0px 30px;
            background: url(../../assets/images/icon-spot.png) 0 2px no-repeat;
            background-position: 12px 5px;
        }
        .entry-event-block{
            height: 335px;
            overflow-y: auto;
            background-color: #3D3C41;
            position: relative;
            .double-video{
                @include toggle-video;
                border-top: 8px solid transparent;
                border-bottom: 8px solid transparent;
                border-left: 8px solid #fff;
            }
            .entry-event-block{
                height: 350px;
                overflow-y: auto;
                background-color: #3D3C41;
                position: relative;
                .double-video{
                    @include toggle-video;
                    border-top: 8px solid transparent;
                    border-bottom: 8px solid transparent;
                    border-left: 8px solid #fff;
                }

            }
            .eagle-event-block{
                position: relative;
                background-color: #3D3C41;
                .single-video{
                    right: 150px;
                    @include toggle-video;
                    border-top: 8px solid transparent;
                    border-bottom: 8px solid transparent;
                    border-right: 8px solid #fff;
                }
            }
            .entry-information{
                padding: 1px 12px;
                background-color: #3D3C41;
                margin-top: 2px;
                p{
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0px;
                }
                .icon-num span{
                    color: #889497;
                    margin: 0px 5px;
                }
            }
        }
    }
    }
</style>