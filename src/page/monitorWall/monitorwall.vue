<template>
    <div class="wrap-room-wall">
        <!-- 头部班级信息 -->
        <nav-header :roomInfo="room_info" :endExam="endExam" :timerNum="timerNum" @getRoomMsg="initMonitorRoom"></nav-header>
        <!-- 展示内容---无考生 -->
        <div class="room-video-tip txt-18px" v-if="permitIsEmpty">{{ $t('monitor.empty') }}</div>
        <span class="nav-btnPrev" v-if="!permitIsEmpty" @click="getPrevSingle()"><i class="icon-nav-btnPrev"></i></span>
        <span class="nav-btnNext" v-if="!permitIsEmpty" @click="getNextSingle()"><i class="icon-nav-btnNext"></i></span>
        <!-- 展示内容---有考生 -->
        <div class="room-video-block" v-if="!permitIsEmpty">
            <ul class="room-video-list">
                <li class="room-video-li" v-for="(item, index) in entryInfo" :key="index" ref="curLi" :permit="item.permit">
                    <span class="video-loading-wrap"></span>
                    <div class="video-entry-content">
                        <p class="video-tag-tip">
                            <i class="ez-icon-font icon-monitor">&#xe73e;</i><span class="icon-monitor">运行中</span>
                            <i v-show="item.pinup" class="ez-icon-font txt-24px icon-dingzhu">&#xe80d;</i>
                            <i v-show="item.openSound" class="ez-icon-font txt-24px icon-yuyin">&#xe80e;</i>
                        </p>
                        <p class="tag-abnormal" v-show="item.monitor_photo_count">{{ $t('monitor.abnormal') }}</p>
                        <img class="entry-picture mb5" v-show="!item.isVideo" ref="entry_img" :src="item.photo_url">
                        <video :id="item.permit" v-show="item.isVideo" ref="entry_video" muted autoplay playsinline></video>
                    </div>
                    <p class="icon-event-content">
                        <i class="ez-icon-font txt-18px" @click="pingVideo(item)">&#xe804;</i>
                        <i v-if="item.audio_monitor" @click="controlSound(item, $event)" class="ez-icon-font txt-18px" v-html="sound"></i>
                        <i v-if="openVideo" @click="openVideo(item)" class="ez-icon-font txt-18px">&#xe66c;</i>
                        <i class="ez-icon-font txt-18px" @click="sendMessage(item)">&#xe63b;</i>
                        <i class="ez-icon-font txt-18px" @click="screenshotCut(item)">&#xe807;</i>
                    </p>
                    <div class="entry-event-block" v-if="!item.eagle_eye">
                        <p class="double-video" v-if="doubleVideo" @click="togglesEventBlock(item, 'one')"></p>
                        <entry-log :entryLog="item" ref="_entryLog"></entry-log>
                    </div>
                    <div class="eagle-event-block" v-if="item.eagle_eye">
                        <p class="single-video" @click="togglesEventBlock(item, 'two')"></p>
                        <eagle-log :eagleLog="item" ref="_eagleLog"></eagle-log>
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
        <send-message :sendMsgData="sendMsgData" :timerPause="timerPause" :eagle_eye="room_info.eagle_eye"
            @_timerPause="timerPause = true" @changeLogs="changeLogs"></send-message>
        <screenshot :screenshotData="screenshotData" :timerPause="timerPause" ref="screenshot"
            @_timerPause="timerPause = true" @changeLogs="changeLogs"></screenshot>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { openSocket, connect, destroyPeer } from './monitorwall.js'
import { getMonitorRoom, getSingleEntry } from '@/utils/api.js'
import navHeader from '@/components/nav-header.component/nav-header'
import entryLog from '@/components/entry-log.component/entry-log'
import eagleLog from '@/components/eagle-log.component/eagle-log'
import sendMessage from '@/components/send-message.component/send-message'
import screenshot from '@/components/screenshot.component/screenshot'
export default {
    data() {
        return {
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
            entry_list: [],    // 考生数组,
            fixed_list: [],     // 存放钉住考生
            doubleVideo: false,
            entryVideo: {},
            sound: '&#xe806;',
            sendMsgData: {},
            screenshotData: {}
        }
    },
    components: {
        entryLog, eagleLog, navHeader, sendMessage, screenshot
    },
    created() {
        this.role = this.$route.query.role;
        if (this.role == "patrol") {
            this.openVideo = false;
            this.endExam = false;
        } else {
            this.openVideo = true;
            this.endExam = true;
        }
        this.$store.commit('SAVE_ROLE', this.role);
    },
    mounted() {
        this.$nextTick(() => {
            this.initMonitorRoom('init');
        });
    },
    computed: {
        ...mapState({
            global: state=>state.global
        })
    },
    methods: {
        initMonitorRoom(action) {
            getMonitorRoom().then(res => {
                let that = this;
                that.room_info = res;
                that.room_info.eagle_eye ? this.doubleVideo = true : this.doubleVideo = false;
                if (res.entries_online.length != 0) {
                    that.permitIsEmpty = false;
                    that.whole_list = res.entries_online;
                    if(action == 'init') { // 初始渲染5个考生
                        openSocket(that.room_info);
                        that.entry_list = that.whole_list.slice(this.entryIndex, 5);
                        that.initStudentVideo(that.entry_list, 'all');
                        that.countDown();
                        console.log(that.entry_list, '初始化');
                    }
                } else {
                    that.permitIsEmpty = true;
                }

            })
            .catch(error => {
                console.log(error);
            }); 
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
        initStudentVideo(entry_list, action){
            console.log(entry_list, 'entry_list--------entry_list')
            if(action == 'all') {
                for (let i = 0, len = entry_list.length; i < len; i++ ) {
                    this.initSingleVideo(entry_list[i], action, i);
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
                    // connect(res.data, action, i, that.$refs);
                    res.data.eagle_eye = that.room_info.eagle_eye;
                    res.data.audio_monitor = that.room_info.audio_monitor;
                    res.data.isVideo = false;
                    res.data.pinup = false;
                    res.data.openSound = false;
                    res.data.openMessageModal = false;
                    res.data.openScreenshotModal = false;
                    if (action != 'prev') {
                        that.entryInfo.push(res.data);
                    } else{
                        that.entryInfo.unshift(res.data);
                    }
                    that.removeEntry(action, that.entryInfo);
                }

            })
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
        controlSound(item, e) {
            let video = $(e.target).parents("li").find("#entry_video")[0];
            item.openSound = !item.openSound;
            console.log(video, 'video')
            if (item.openSound) {
                video.muted = false;
                this.sound = '&#xe805;';
            } else {
                video.muted = true;
                this.sound = '&#xe806;';
            }
        },
        sendMessage(item) {
            item.openMessageModal = true;
            this.sendMsgData = item;
            this.timerPause = false;
        },
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
        // 更换日志
        changeLogs(data) {
            console.log(data, 'data//////////data')
            let _entryLogs = this.$refs._entryLog,
                _singleEntryInfo = this.entryInfo;
            for (let i = 0, len = _entryLogs.length; i < len; i++) {
                console.log(_entryLogs[i].$el, 'entry-log---ul')
                if ($(_entryLogs[i].$el).attr("id") == data.permit) {
                    _entryLogs[i].getLogs(data)
                }
            }
            if (data.type == 'screenshot') {
                for (let i = 0, len = _singleEntryInfo.length; i < len; i++) {
                    console.log(_singleEntryInfo[i], '_singleEntryInfo---ul')
                    if (_singleEntryInfo[i].permit == data.permit) {
                        _singleEntryInfo[i].machine_photo_count = data.machine_photo_count;
                        _singleEntryInfo[i].error_screen_photo_count = data.error_screen_photo_count;
                    }
                }
            }
        },
        autoRefresh() {
            this.autoToggleSingle();
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
        togglesEventBlock(item, toggles) {
            toggles == 'one' ? item.eagle_eye = true : item.eagle_eye = false;
        },
        // 寻找每个页面最后一个考生在列表中的索引
        findEntryIndex(arr, ele) {
            for(let i=0, len = arr.length; i<len; i++){
                if(arr[i] == ele){ return i; }              
            }
        }
    }
}
</script>

<style scoped lang="scss">
@import './monitorwall.scss';
</style>