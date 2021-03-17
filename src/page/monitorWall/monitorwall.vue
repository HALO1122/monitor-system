<template>
    <div class="wrap-room-wall">
        <!-- 头部班级信息 -->
        <nav-header :roomInfo="room_info" :endExam="endExam" :timerNum="timerNum" @getRoomMsg="initMonitorRoom"></nav-header>
        <div id="search_wrap" class="mr20 mt10 mb10">
            <input type="text" class="form-control" v-model="searchData" :placeholder="$t('monitor.search._place')" name="keyword">
            <button class="btn-search" type="submit" @click="search_entry()"><i class="ez-icon-font icon-monitor">&#xe6dc;</i></button>
        </div>
        <!-- 展示内容---无考生 -->
        <div class="room-video-tip txt-18px" v-if="permitIsEmpty">{{ $t('monitor.empty') }}</div>
        <span class="nav-btnPrev" v-if="!permitIsEmpty" @click="getPrevSingle()"><i class="icon-nav-btnPrev"></i></span>
        <span class="nav-btnNext" v-if="!permitIsEmpty" @click="getNextSingle()"><i class="icon-nav-btnNext"></i></span>
        <p class="monitor-error-tip mt10" v-if="monitorError">
            <i class="ez-icon-font">&#xe721;</i>&nbsp;&nbsp;<span>{{monitorErrorTip}}</span>
            <i class="ez-icon-font ml20" @click="monitorError = false">&#xe7bf;</i>
        </p>
        <!-- 展示内容---有考生 -->
        <div class="room-video-block" v-if="!permitIsEmpty">
            <ul class="room-video-list">
                <li class="room-video-li" v-for="item in entryInfo" :key="item.permit" ref="curLi" :permit="item.permit">
                    <span class="video-loading-wrap"></span>
                    <div class="video-entry-content">
                        <p class="video-tag-tip">
                            <i class="ez-icon-font icon-monitor">&#xe73e;</i><span class="icon-monitor">{{item.videoStatus}}</span>
                            <i v-show="item.openSound" class="ez-icon-font txt-24px icon-yuyin">&#xe80d;</i>
                            <i v-show="item.pinup" class="ez-icon-font txt-24px icon-dingzhu">&#xe80e;</i>
                        </p>
                        <p class="tag-abnormal" v-show="item.monitor_photo_count">{{ $t('monitor.abnormal') }}</p>
                        <img class="entry-picture mb5" v-show="!item.isVideo" ref="entry_img" :src="item.photo_url">
                        <video :id="item.permit" class="entry-video" v-show="item.isVideo" ref="entry_video" muted autoplay playsinline></video>
                    </div>
                    <!-- icon 事件 -->
                    <p class="icon-event-content">
                        <i class="ez-icon-font txt-18px" @click="pingVideo(item)">&#xe804;</i>
                        <i v-if="item.audio_monitor" @click="controlSound(item, $event)" class="ez-icon-font txt-18px" v-html="sound"></i>
                        <i v-if="openVideo" @click="openCallVideo(item, $event)" class="ez-icon-font txt-18px">&#xe66c;</i>
                        <i class="ez-icon-font txt-18px" @click="sendMessage(item)">&#xe63b;</i>
                        <i class="ez-icon-font txt-18px" @click="screenshotCut(item)">&#xe807;</i>
                    </p>
                    <div class="entry-event-block" v-if="!item.eagle_eye">
                        <p class="double-video" v-if="doubleVideo" @click="togglesEventBlock(item, 'one')"></p>
                        <entry-log :entryLog="item" ref="_entryLog"></entry-log>
                    </div>
                    <div class="eagle-event-block" v-if="item.eagle_eye">
                        <p class="single-video" @click="togglesEventBlock(item, 'two')"></p>
                        <eagle-log :eagleLog="item" ref="_eagleLog" :eagle_video_idx="eagle_video_idx" :action="action"
                            :peers="peers" :to_peers="to_peers" :timerPause="timerPause" @_timerPause="timerPause = false"></eagle-log>
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
                </li>
            </ul>
        </div>
        <send-message v-if="sendMsgData.openMessageModal" :sendMsgData="sendMsgData" :timerPause="timerPause" :eagle_eye="room_info.eagle_eye"
            @_timerPause="timerPause = true" ></send-message>
        <screenshot v-show="screenshotData.openScreenshotModal" :screenshotData="screenshotData" :timerPause="timerPause" ref="screenshot"
            @_timerPause="timerPause = true"></screenshot>
        <sendVideo :callVideoData="callVideoData" :timerPause="timerPause" @_timerPause="timerPause = true"></sendVideo>
            <!--  @changeLogs="changeLogs" -->
        <search-entry v-if="searching" @searchModelClose="(data) => {this.searching = data}" :search_entry_data="search_entry_data" :room_info="room_info" @touchmove.prevent></search-entry>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { getMonitorRoom, getSingleEntry, searchSingleEntry, saveProctorSocketId } from '@/utils/api.js'
import navHeader from '@/components/nav-header.component/nav-header'
import entryLog from '@/components/entry-log.component/entry-log'
import eagleLog from '@/components/eagle-log.component/eagle-log'
import sendMessage from '@/components/send-message.component/send-message'
import screenshot from '@/components/screenshot.component/screenshot'
import searchEntry from '@/components/search-entry.component/search-entry'
import sendVideo from '@/components/send-video.component/send-video'
const Peer = require('simple-peer');
export default {
    data() {
        return {
            peers: {},
            to_peers: {},
            room_info: {},
            role: "",
            permitIsEmpty: true,
            timerNum: 10,
            timeClock: null,
            timerPause: true,
            openVideo: false,
            endExam: false,
            entryInfo: [],
            entryIndex: 0,     // 某个考生在考生列表的索引值
            whole_list: [],    // 所有考生列表
            whole_info_list: [],    // 所有考生姓名列表
            entry_list: [],    // 考生数组,
            fixed_list: [],     // 存放钉住考生
            doubleVideo: false,
            entryVideo: {},
            sound: '&#xe806;',
            sendMsgData: {},
            screenshotData: {},
            callVideoData: {},
            searchData: "",
            searching: false,
            monitorError: false,
            monitorErrorTip: "这是错误提示",
            search_entry_data: [],
            action: '',
            eagle_video_idx: 0
        }
    },
    components: {
        entryLog, eagleLog, navHeader, sendMessage, screenshot, searchEntry, sendVideo
    },
    created() {
        this.role = this.$route.query.role;
        this.$store.commit('SAVE_ROLE', this.role);
        if (this.role == "patrol") {
            this.openVideo = false; this.endExam = false;
        } else {
            this.openVideo = true; this.endExam = true;
        }
        
    },
    mounted() {
        this.initMonitorRoom('init');
        
    },
    computed: {
        ...mapState({ global: state=>state.global })
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
        initMonitorRoom(action) {
            getMonitorRoom().then(res => {
                console.log(res,'-------res-------');
                let that = this;
                that.room_info = res;   
                that.room_info.eagle_eye ? this.doubleVideo = true : this.doubleVideo = false;
                if (res.entries_online.length != 0) {
                    that.permitIsEmpty = false;
                    that.whole_list = res.entries_online;
                    that.getInfoList(that.whole_list);
                    if(action == 'init') { // 初始渲染5个考生
                        that.entry_list = that.whole_list.slice(this.entryIndex, 5);
                        console.log(that.entry_list);
                        that.saveSocketId();
                        that.initStudentVideo(that.entry_list, 'all');
                        that.countDown();
                    }
                } else {
                    that.permitIsEmpty = true;
                }

            }).catch(error => {
                console.log(error);
            }); 
        },
        // 获取所有考生姓名及准考证
        getInfoList(permitList) {
            permitList.forEach(permit => {
                let msg = {"permit": permit},
                info = {
                    name: '',
                    permit: ''
                }
                getSingleEntry({ data: msg }).then(res => {
                    info.name = res.data.full_name;
                    info.permit = permit;
                    this.whole_info_list.push(info);
                })
            })
            console.log(this.whole_info_list,'--------------name and permit-----------------');

        },
        // 保存监考老师socketId
        saveSocketId() {
            if (this.$socket.connected && this.role == 'proctor') {
                let msg = {"teacher_socket": this.$socket.id};
                saveProctorSocketId({ data: msg }).then(res => { }).catch(err => { console.log(err)  })
            }
        },
        countDown() {
            let that = this;
            that.timeClock = setInterval(function(){
                if(that.timerPause) {
                    that.timerNum--;
                    if (that.timerNum == 0) { 
                        that.timerNum = 10;
                        // that.autoRefresh();                    
                        clearInterval(that.timeClock)
                    }
                } else {
                    that.timerNum = that.timerNum;
                }
            }, 1000)
        },
        async initStudentVideo(entry_list, action){
            console.log(entry_list, 'entry_list--------')
            if(action == 'all') {
                for (let i = 0, len = entry_list.length; i < len; i++ ) {
                    await this.initSingleVideo(entry_list[i], action, i);
                }
            } else {
                this.initSingleVideo(entry_list[0], action, 0);
            }
        },
        async initSingleVideo(permit, action, i) {
            let msg = {"permit": permit},
                that = this;
            await getSingleEntry({ data: msg }).then(res => {
                if (res.code == 200) {
                    this.eagle_video_idx = i;
                    this.action = action;
                    this.connect(res.data, action, i, that.$refs);
                    res.data.eagle_eye = that.room_info.eagle_eye;
                    res.data.audio_monitor = that.room_info.audio_monitor;
                    res.data.isVideo = false;
                    res.data.pinup = false;
                    res.data.openSound = false;
                    res.data.openMessageModal = false;
                    res.data.openScreenshotModal = false;
                    res.data.openVideoCallModal = false;
                    res.data.videoStatus = this.$t('monitor.connecting');
                    if (action != 'prev') {
                        that.entryInfo.push(res.data);
                    } else{
                        that.entryInfo.unshift(res.data);
                    }
                    // that.removeEntry(action, that.entryInfo);
                    console.log(that.entryInfo,'-----entryInfo------');
                }
            })
        },
        autoRefresh() {
            if(this.entryInfo.length > 5) {
                this.autoToggleSingle();
            }
        },
        getPrevSingle() {
            // 获取列表中第一个没有被钉住的考生的permit
            let that = this,
                not_pinned_list = [],
                firstEntryIndex = 0;
            that.entry_list = [];
            
            that.entryInfo.forEach(item => {
                if (!item.pinup) { not_pinned_list.push(item.permit); }
            })
            console.log(not_pinned_list, 'not_pinned_list')
            firstEntryIndex = that.findEntryIndex(that.whole_list, not_pinned_list[0]);

            if (firstEntryIndex != 0) {
                that.whole_list = that.whole_list.filter(item => !that.fixed_list.includes(item) );
                that.entry_list.push(that.whole_list[firstEntryIndex-1]);
                that.initStudentVideo(that.entry_list, 'prev');
            } 
        },
        getNextSingle() {
            let singleLi = $('.room-video-li');
            if (singleLi.length > 4) { this.autoToggleSingle(); }
        },
        autoToggleSingle() {
            let that = this,
                singleLi = $('.room-video-li'),
                lastPermit = that.entryInfo[singleLi.length - 1].permit;
            that.entry_list = [];

            // 过滤钉住的考生
            that.whole_list = that.whole_list.filter(item => !that.fixed_list.includes(item) );
            // 最后一个考生在列表中的索引值、浏览到最后一个重新请求列表
            that.entryIndex == undefined ? that.entryIndex = 0 : that.entryIndex = that.findEntryIndex(that.whole_list, lastPermit);
            console.log(that.entryIndex, 'that.entryIndex')

            if (that.entryIndex != that.whole_list.length - 1) {
                that.entry_list = that.whole_list.slice(that.entryIndex+1, that.entryIndex+2);
            } else {
                that.initMonitorRoom('reload');
                that.entry_list = that.whole_list.slice(0, 1);
            }

            if (that.entry_list.length != 0) that.initStudentVideo(that.entry_list, 'next');
        },
        removeEntry(action, entry_info) {
            let pinupList = [], removeList = [];
            entry_info.filter(item => { !item.pinup ? removeList.push(item) : pinupList.push(item); });

            console.log(entry_info, 'entry_info')
            if (action == 'next') {
                // 合并[钉住的考生] 和 [删除没有钉住的考生第一个]
                removeList.splice(0,1);
                this.entryInfo = pinupList.concat(removeList);
                // destroyPeer(item);
                // 获取remove掉的item.permit 根据permit找到对应li，销毁上面的peer_id
            } else if (action == 'prev') {
                removeList.pop();
                this.entryInfo = pinupList.concat(removeList)
            }
            console.log(entry_info, 'entry_info');
            console.log(removeList, 'removeList');
        },
        // 切换log
        togglesEventBlock(item, toggles) {
            toggles == 'one' ? item.eagle_eye = true : item.eagle_eye = false;
        },
        // 钉住考生
        pingVideo(item) {
            if (item.pinup) {
                item.pinup = false;
                // 从数组中取消钉住的考生
                this.fixed_list.splice(this.fixed_list.indexOf(item.permit), 1);
            } else {
                item.pinup = true;
                // 将钉住的考生存放数组中并去重
                this.entryInfo.filter((item, index) => { if(item.pinup) this.fixed_list.push(item.permit) });
                this.fixed_list = this.fixed_list.filter(function(item, index, array) { return array.indexOf(item) === index; });
            }
            console.log(this.fixed_list, 'this.fixed_list')
        },
        // 控制考生声音
        controlSound(item, e) {
            let video = $(e.target).parents("li").find(".entry-video")[0];
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
            this.timerPause = false;
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
        // 视频通话
        openCallVideo(item, e) {
            let curLi = $(e.target).parents("li"), video, eagleVideo;
            video = curLi.find(".entry-video")[0];
            eagleVideo = curLi.find(".eagle-video")[0];

            item.studentStream = video.srcObject;
            if (eagleVideo != undefined && item.eagle_eye) {
                item.eagleStream = eagleVideo.srcObject;
            }
            item.openVideoCallModal = true;
            this.timerPause = false;
            this.callVideoData = item;
        },
        // 获取查询考生数据
        search_entry() {
            console.log(this.searchData, 'searchData')
            if (this.searchData != "") {
                console.log(this.whole_info_list)
                let searchDataFilter = this.whole_info_list.filter(item => 
                    item.permit == this.searchData || item.name == this.searchData
                )
                if (!searchDataFilter[0]) {
                    this.monitorError = true,
                    this.monitorErrorTip = "查询不到该考生！"
                } else {
                    searchSingleEntry({ data: searchDataFilter[0].permit }).then(res => {
                        console.log(res, 'search--res')
                        if (res.code == 200) {
                            this.search_entry_data = res.data;
                            if (this.search_entry_data.length > 0) {
                                this.monitorError = true,
                                this.monitorErrorTip = "存在重复的姓名,只显示一个考生,请按准考证搜索"
                            }
                            this.search_entry_data[0].openSound = false;
                            this.search_entry_data[0].openMessageModal = false;
                            this.search_entry_data[0].openScreenshotModal = false;
                            this.search_entry_data[0].isVideo = true; // 
                            this.search_entry_data[0].pinup = false;
                            console.log(this.search_entry_data, 'this.search_entry_data')
                            this.searching = true;
                            if (this.entry_list.includes(this.search_entry_data[0].permit)) {
                                
                            } else {
                                
                            }
                            
                        } else {
                            this.monitorError = true,
                            this.monitorErrorTip = "查询不到该考生！"
                        }
                    })
                }
                
            } else {
                
                // this.initStudentVideo(this.entry_list, 'all');
            }
        },
        // 寻找每个页面最后一个考生在列表中的索引
        findEntryIndex(arr, ele) {
            for(let i=0, len = arr.length; i<len; i++){
                if(arr[i] == ele){ return i; }              
            }
        },
        connect(res, action, i, refs) {
            let that = this, peer = new Peer();
            that.peers[peer._id] = peer;

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
                    to_peer: that.to_peers[peer._id],
                    msg: data
                }
                that.$socket.emit("message", pkt);
            });

            peer.on('connect', function() {
                console.log('peer------------------connect');
            });

            peer.on('stream', function(stream) {
                refs.entry_video[i].srcObject = stream;
                $(refs.curLi[i]).attr("peer_id", peer._id);
                res.videoStatus = that.$t('monitor.running');
                res.isVideo = true;
                console.log(stream,'stream available: ');
            });
            peer.on('data', function(data) {
                console.log('data available');
            });
            peer.on('close', function() {
                res.isVideo = false;
                res.videoStatus = that.$t('monitor.disconnect');
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
            that.$socket.emit("message", pkt)
        }
    }
}
</script>

<style scoped lang="scss">
@import './monitorwall.scss';
</style>