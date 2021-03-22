<template>
    <div :id="logs.permit">
        <p class="tag-monitor-status"><i class="ez-icon-font">&#xe95c;</i> {{eagleTip}}</p>
        <div class="eagle-show">
            <img :src="logs.eagle_photo_url" v-show="!isEagleVideo" width="100%">
            <video class="eagle-video" ref="eagle_video" v-show="isEagleVideo" muted autoplay playsinline></video>
        </div>
        <ul class="eagle-entry-log">
            <vue-scroll :ops="ops">
                <li v-for="(subitem,index) in logs.entry_log" :key="index">
                    <div v-if="subitem.login"><p class="login">{{ $t('monitor.login') }}</p><p>{{subitem.login}}</p></div>
                    <div v-if="subitem.eagle_login"><p class="login">{{ $t('monitor.eagle') }}</p><p>{{subitem.eagle_login}}</p></div>
                    <div v-if="subitem.error_screen"><p class="monitor">{{ $t('monitor.screen') }}</p><p>{{subitem.error_screen.time}}</p></div>
                    <div v-if="subitem.entry_message"><p class="login">{{ $t('monitor.proctor_message') }}</p><p>{{subitem.entry_message.time}}</p></div>
                    <div v-if="subitem.entry_call"><span class="login">{{ $t('monitor.proctor_call') }}</span><p>{{subitem.entry_call.time}}</p></div>
                    <div v-if="subitem.leave"><span class="leave">{{ $t('monitor.leave') }}</span><p>{{subitem.leave}}</p></div>
                    <div v-if="subitem.end"><span class="end">{{ $t('monitor.end') }}</span><p>{{subitem.end}}</p></div>
                    <div v-if="subitem.cancelEnd"><span class="end">{{ $t('monitor.cancelEnd') }}</span><p>{{subitem.cancelEnd}}</p></div>
                    <div v-if="subitem.force"><span class="force">{{ $t('monitor.force') }}</span><p>{{subitem.force}}</p></div>
                    <div v-if="subitem.timeout"><span class="timeout">{{ $t('monitor.timeout') }}</span><p>{{subitem.timeout}}</p></div>
                    <div v-if="subitem.out"><span class="out">{{ $t('monitor.out') }}</span><p>{{subitem.out}}</p></div>
                </li>
            </vue-scroll>
        </ul>
        <i class="ez-icon-font eagle-cut txt-18px" @click="screenshotEagleCut(logs)">&#xe807;</i>
    </div>
</template>

<script>
import Bus from '@/utils/bus.js';
import { getSingleEntry } from '@/utils/api.js';
const Peer = require('simple-peer');
export default {
    name: "eagle-log",
    data() {
        return{
            isEagleVideo: false,
            eagleStatus: "",
            eagleTip: this.$t('monitor.connecting'),
            destroyPeer: null,
            eaglereconnecttimer: null,
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
        },
        entryStatus() {
            return this.entryStatusShow
        }
    },
    watch: {
        entryStatus(status) {
            if (status) {
                if (this.destroyPeer != null) this.destroyPeer.destroy();
                this.clearTimer(this.eaglereconnecttimer)
            }
        }
    },
    props: {
        eagleLog: {
            type: Object,
            dafault: {}
        },
        peers: {
            type: Object,
            dafault: {}
        },
        to_peers: {
            type: Object,
            dafault: {}            
        },
        entryStatusShow: {
            type: Boolean,
            dafault: false
        }
    },
    mounted() {
        // 初始化数据
        this.init();
        // 更新日志
        this.changeLog();
    },
    destroyed() {
        if (this.destroyPeer != null) this.destroyPeer.destroy();
        this.clearTimer(this.eaglereconnecttimer)
    },
    methods: {
        init() {
            let eagleSocketId = this.logs.eagle_socket_id;
            if (eagleSocketId != null && eagleSocketId != '') {
                this.connect(eagleSocketId, this.$refs)
            } else {
                this.eagleTip = this.$t('monitor.notLogin');
            }
        },
        changeLog() {
            Bus.$on('changeLogs', target => {
                if (this.logs.permit == target.permit) {
                    this.logs.entry_log = target.logs;
                }
            });
            Bus.$on('screenshotLogs', target => {
                if (this.logs.permit == target.permit) {
                    this.logs.entry_log = target.logs;
                    this.logs.error_screen_photo_count = target.error_screen_photo_count;
                    this.logs.machine_photo_count = target.machine_photo_count;
                }
            });
            Bus.$on('callVideoLogs', target => {
                if (this.logs.permit == target.permit) {
                    this.logs.entry_log = target.logs;
                }
            });
        },
        // 鹰眼截屏
        screenshotEagleCut(item) {
            item.openScreenshotModal = true;
            let _eagleVideo = this.$refs.eagle_video;
            // Bus.$emit('controlScreenshot', { "item": item, "video": _eagleVideo});
            Bus.$emit('controlMainScreenshot', { "permit": item.permit, "video": _eagleVideo});
        },
        connect(eagleSocketId, refs) {
            let that = this, peer = new Peer();
            that.peers[peer._id] = peer;
            that.destroyPeer = peer;

            peer.on('signal', function (data) {
                var pkt = {
                    type: "signal",
                    to: eagleSocketId,
                    from_peer: peer._id,
                    to_peer: that.to_peers[peer._id],
                    msg: data
                }
                that.$socket.emit("message", pkt);
            });

            peer.on('connect', function() {
                that.clearTimer(that.eaglereconnecttimer)
                console.log('peer------eagle_connect');
            });

            peer.on('stream', function(stream) {
                that.isEagleVideo = true;
                that.eagleTip = that.$t('monitor.running');
                refs.eagle_video.srcObject = stream;
                console.log(stream,'stream available: ');
            });
            peer.on('data', function(data) {
                console.log('data available');
            });
            peer.on('close', function() {
                that.isEagleVideo = false;
                that.eagleTip = that.$t('monitor.disconnect');
                console.log('peer------eagle_closed');
            });
            peer.on('error', function(error) {
                that.eagleCloseReconnect();
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
        },
        // 考生鹰眼peer断开之后重连
        eagleCloseReconnect() {
            let that = this;
            that.eaglereconnecttimer = setInterval(function() {
                getSingleEntry({ data: {"permit": that.logs.permit} }).then(res => {
                    if (res.code == 200) {
                        that.connect(res.data.eagle_socket_id, that.$refs);
                        console.log('鹰眼20s 重连');
                    }
                }).catch(() => {
                    that.clearTimer(that.eaglereconnecttimer);
                })
            }, 20000)
        },
        // 清除定时器
        clearTimer(timer){
            if (timer){
                clearInterval(timer);
                timer = null;
            } 
        }
    }
}
</script>

<style lang="scss" scoped>
@import './eagle-log.scss';
</style>