<template>
    <div :id="logs.permit">
        <p class="tag-monitor-status"><i class="ez-icon-font">&#xe95c;</i> {{eagleTip}}</p>
        <div class="eagle-show">
            <img :src="logs.eagle_photo_url" v-show="!isEagleVideo" width="100%">
            <video class="eagle-video" ref="eagle_vidoe" v-show="isEagleVideo" muted autoplay playsinline></video>
        </div>
        <ul class="eagle-entry-log">
            <vue-scroll :ops="ops">
                <li v-for="(subitem,index) in logs.entry_log" :key="index">
                    <div v-if="subitem.login"><p class="login">登录考试</p><p>{{subitem.login}}</p></div>
                    <div v-if="subitem.eagle_login"><p class="login">进入鹰眼</p><p>{{subitem.eagle_login}}</p></div>
                    <div v-if="subitem.error_screen"><p class="monitor">截屏异常</p><p>{{subitem.error_screen.time}}</p></div>
                    <div v-if="subitem.entry_message"><p class="login">监考发消息</p><p>{{subitem.entry_message.time}}</p></div>
                    <div v-if="subitem.entry_call"><span class="login">监考通话</span><p>{{subitem.entry_call.time}}</p></div>
                    <div v-if="subitem.leave"><span class="leave">离开考试</span><p>{{subitem.leave}}</p></div>
                    <div v-if="subitem.end"><span class="end">交卷</span><p>{{subitem.end}}</p></div>
                    <div v-if="subitem.force"><span class="force">强制交卷</span><p>{{subitem.force}}</p></div>
                    <div v-if="subitem.timeout"><span class="timeout">自动收卷</span><p>{{subitem.timeout}}</p></div>
                    <div v-if="subitem.out"><span class="out">离开页面</span><p>{{subitem.out}}</p></div>
                </li>
            </vue-scroll>
        </ul>
        <i class="ez-icon-font eagle-cut txt-18px">&#xe807;</i>
    </div>
</template>

<script>
import Bus from '@/utils/bus.js'; 
const Peer = require('simple-peer');
export default {
    name: "eagle-log",
    data() {
        return{
            isEagleVideo: false,
            eagleStatus: "",
            eagleTip: this.$t('monitor.connecting'),
            ops: {
                vuescroll: {},
                scrollPanel: {},
                rail: {
                    background: "#555557",    //轨道的背景色。
                    opacity: 0.4,            //轨道的透明度。 0是透明，1是不透明
                    size: "8px",             //轨道的尺寸。
                    specifyBorderRadius: false, //是否指定轨道的 borderRadius， 如果不那么将会自动设置。
                    gutterOfEnds: null,
                    gutterOfSide: "0px",      //距离容器的距离
                    keepShow: false
                },
                bar: {
                    hoverStyle: false,
                    onlyShowBarOnScroll: false, //是否只有滚动的时候才显示滚动条
                    background: "#f1f1f1",
                    opacity: 0.4,
                    "overflow-x": "hidden"
                }
            }
        }
    },
    computed: {
        logs (){
            return this.eagleLog
        }
    },
    props: {
        eagleLog: {
            type: Object,
            dafault: {}
        },
        eagle_video_idx: {
            type: Number,
            dafault: 0
        },
        action: {
            type: String,
            dafault: ''
        },
        peers: {
            type: Object,
            dafault: {}
        },
        to_peers: {
            type: Object,
            dafault: {}            
        }
    },
    mounted() {
        let eagleSocketId = this.logs.eagle_socket_id;
        if (eagleSocketId != null && eagleSocketId != '') {
            this.connect(eagleSocketId, this.action, this.eagle_video_idx, this.$refs)
        }
        this.changeLog();
    },
    methods: {
        changeLog() {
            Bus.$on('changeLogs', target => {
                if (this.logs.permit == target.permit) {
                    this.logs.entry_log = target.logs;
                }
            });
            Bus.$on('screenshotLogs', target => {
                if (this.logs.permit == target.permit) {
                    this.logs.entry_log = target.logs;
                }
            });
        },
        connect(eagleSocketId, action, i, refs) {
            let that = this, peer = new Peer();
            that.peers[peer._id] = peer;

            if (action == 'all') {
                i = i;
            } else if(action == 'next') {
                i = refs.curLi.length - 1;
            } else if(action == 'prev') {
                i = 0;
            }
            console.log(that.$socket, 'that.$socket')
            peer.on('signal', function (data) {
                var pkt = {
                    type: "signal",
                    to: eagleSocketId,
                    from_peer: peer._id,
                    to_peer: that.to_peers[peer._id],
                    msg: data
                }
                console.log(pkt, 'eagle---pkt')
                that.$socket.emit("message", pkt);
            });

            peer.on('connect', function() {
                console.log('peer------------------eagle_connect');
            });

            peer.on('stream', function(stream) {
                that.isEagleVideo = true;
                that.eagleTip = that.$t('monitor.running');
                refs.eagle_vidoe.srcObject = stream;
                console.log(stream,'stream available: ');
            });
            peer.on('data', function(data) {
                console.log('data available');
            });
            peer.on('close', function() {
                that.isEagleVideo = false;
                that.eagleTip = that.$t('monitor.disconnect');
                console.log('peer------------------closed');
            });
            peer.on('error', function(error) {
                console.log('error: ',error);
            });
            // make the call
            var pkt = {
                type: "call",
                to: eagleSocketId,
                from_peer: peer._id
            }
            console.log(pkt, 'pkt')
            that.$socket.emit("message", pkt)
        }
    }
}
</script>

<style lang="scss" scoped>
@import './eagle-log.scss';
</style>