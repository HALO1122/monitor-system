<template>
    <div class="wrap-room-wall">
        <!-- 头部班级信息 -->
        <nav-header :roomInfo="room_info" :endExam="endExam" :timerNum="timerNum"></nav-header>
        <!-- 展示内容---无考生 -->
        <div class="room-video-tip txt-18px" v-if="permitIsEmpty">{{ $t('monitor.empty') }}</div>
        <span class="nav-btnPrev" v-if="!permitIsEmpty" @click="getPrevDta()"><i class="icon-nav-btnPrev"></i></span>
        <span class="nav-btnNext" v-if="!permitIsEmpty" @click="getNextDta()"><i class="icon-nav-btnNext"></i></span>
        <!-- 展示内容---有考生 -->
        <div class="room-video-block" v-if="!permitIsEmpty">
            <ul class="room-video-list">
                <li class="room-video-li" v-for="item in entryInfo" :key="item.permit">
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
import { openSocket, connect } from './monitorwall.js'
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
            entry_list: [],
            entryIndex : 0,
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
            this.initMonitorRoom();
        });
    },
    computed: {
        ...mapState({
            global: state=>state.global
        })
    },
    methods: {
        initMonitorRoom() {
            getMonitorRoom().then(res => {
                let that = this;
                that.room_info = res;
                that.room_info.eagle_eye ? this.doubleVideo = true : this.doubleVideo = false;
                if (res.entries_online.length != 0) {
                    that.permitIsEmpty = false;
                    openSocket(that.room_info);
                    // 初始渲染5个考生
                    this.entry_list = res.entries_online.slice(this.entryIndex, 5);
                    console.log(this.entry_list, '初始化')
                    this.initStudentVideo(this.entry_list, 'all');
                } else {
                    that.permitIsEmpty = true;
                }
                that.timeClock = setInterval(function(){
                    if(that.timerPause) {
                        that.timerNum--;
                        if (that.timerNum == 0) { 
                            that.timerNum = 10;
                            // autoRefresh();
                            clearInterval(that.timeClock)
                        }
                    } else {
                        that.timerNum = that.timerNum;
                    }
                }, 1000)
            })
            .catch(error => {
                console.log(error);
            }); 
        },
        initStudentVideo(entry_list, action){
            if(action == 'all') {
                for (let i = 0, len = entry_list.length; i < len; i++ ) {
                    this.initSingleVideo(entry_list[i], action, i);
                }
            } else {
                this.initSingleVideo(entry_list[i], action, i);
            }
        },
        initSingleVideo(permit, action, i) {
            let msg = {"permit": permit},
                self = this;
            getSingleEntry({ data: msg }).then(res => {
                if (res.code == 200) {
                    connect(res.data, action, i, self.$refs);
                    res.data.eagle_eye = self.room_info.eagle_eye;
                    res.data.audio_monitor = self.room_info.audio_monitor;
                    res.data.isVideo = false;
                    res.data.pinup = false;
                    res.data.openSound = false;
                    res.data.openMessageModal = false;
                    res.data.openScreenshotModal = false;
                    self.entryInfo.push(res.data);
                    console.log(this.entryInfo, 'entry-res')
                }

            })
        },
        pingVideo(item) {
            console.log(item, 'item')
            item.pinup = !item.pinup;
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
                console.log(this.entryInfo, 'entryInfo----screenshot');
                for (let i = 0, len = _singleEntryInfo.length; i < len; i++) {
                    console.log(_singleEntryInfo[i], '_singleEntryInfo---ul')
                    if (_singleEntryInfo[i].permit == data.permit) {
                        _singleEntryInfo[i].machine_photo_count = data.machine_photo_count;
                        _singleEntryInfo[i].error_screen_photo_count = data.error_screen_photo_count;
                    }
                }
            }
        },
        getPrevDta() {
            this.entryInfo.entry_log
            this.entryInfo.pop(0,1);
            console.log(this.entryInfo,'prev')
        },
        getNextDta() {
            this.entryInfo.splice(0,1);
            console.log(this.entryInfo,'next')
        },
        togglesEventBlock(item, toggles) {
            toggles == 'one' ? item.eagle_eye = true : item.eagle_eye = false;
        }
    }
}
</script>

<style scoped lang="scss">
@import './monitorwall.scss';
</style>