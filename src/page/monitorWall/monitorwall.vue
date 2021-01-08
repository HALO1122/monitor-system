<template>
    <div class="wrap-room-wall">
        <!-- 头部班级信息 -->
        <nav-header :roomInfo="room_info" :role="role"></nav-header>
        <!-- 展示内容---无考生 -->
        <div class="room-video-tip txt-16px" v-if="permitIsEmpty">暂无考生信息！</div>
        <span class="nav-btnPrev" v-if="!permitIsEmpty" @click="getPrevDta()"><i class="icon-nav-btnPrev"></i></span>
        <span class="nav-btnNext" v-if="!permitIsEmpty" @click="getNextDta()"><i class="icon-nav-btnNext"></i></span>
        <!-- 展示内容---有考生 -->
        <div class="room-video-block" v-if="!permitIsEmpty">
            <ul class="room-video-list">
                <li class="room-video-li" v-for="(item, index) in entryInfo" :key="index">
                    <span class="video-loading-wrap"></span>
                    <div class="video-entry-content">
                        <p class="video-tag-tip">
                            <span class="tag-monitor-status"><i class="ez-icon-font">&#xe73e;</i> 运行中</span>
                            <span class="icon-dingzhu"><i class="ez-icon-font txt-24px">&#xe80d;</i></span>
                            <span class="icon-yuyin"><i class="ez-icon-font txt-24px">&#xe80e;</i></span>
                            <span class="tag-abnormal">有异常</span>
                        </p>
                        <a href="#" target="_blank"><img class="entry-picture mb5" src="">
                        <!-- {{item.photo_url}} -->
                            <video id="entry_video" muted="" autoplay="" playsinline=""></video></a>
                    </div>
                    <p class="icon-event-content">
                        <span id="icon-pinVideo"><i class="ez-icon-font txt-18px">&#xe804;</i></span>
                        <span id="icon-controlSound"><i class="ez-icon-font txt-18px">&#xe806;</i></span>
                        <span id="icon-openVideo"><i class="ez-icon-font txt-18px">&#xe66c;</i></span>
                        <span id="icon-sendMsg"><i class="ez-icon-font txt-18px">&#xe63b;</i></span>
                        <span id="icon-cut"><i class="ez-icon-font txt-18px">&#xe807;</i></span>
                    </p>
                    <div class="entry-event-block" v-if="!item.eagle_socket_id">
                        <p class="double-video" @click="togglesEventBlock(item, 'one')"></p>
                        <ul class="entry-log pt10 pb10">
                            <entry-log :entryLog="subitem" v-for="(subitem, index) in item.entry_log" :key="index"></entry-log>
                        </ul>
                    </div>
                    <div class="eagle-event-block" v-if="item.eagle_socket_id">
                        <p class="single-video" @click="togglesEventBlock(item, 'two')"></p>
                        <eagle-log :eagleLog="item"></eagle-log>
                    </div>
                    <div class="entry-information">
                        <p><span>{{item.permit}} | {{item.full_name}}</span>
                            <span class="icon-num">
                                <span><i class="ez-icon-font">&#xe81f;</i>{{item.machine_photo_count}}</span>
                                <span><i class="ez-icon-font">&#xe807;</i>{{item.monitor_photo_count}}</span>
                            </span></p>
                        <p class="exam">
                            <span class="exam-answer">答题时长：{{item.time_spent}}</span>
                            <span class="exam-complete">已答：{{item.answered_num}} / {{item.item_num}}题</span>
                        </p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { openSocket, connect } from './monitorwall.js'
import { getMonitorRoom, getSingleEntry } from '@/utils/api.js'
import navHeader from '@/components/nav-header.component/nav-header'
import entryLog from '@/components/entry-log.component/entry-log'
import eagleLog from '@/components/eagle-log.component/eagle-log'
export default {
    data() {
        return {
            room_info: {},
            role: "",
            permitIsEmpty: true,
            timeClock: null,
            timePause: true,
            endExam: true,
            entryInfo: [],
            entry_list: [],
            entryIndex : 0,
            togglesEventLog: true
        }
    },
    components: {
        entryLog, eagleLog, navHeader
    },
    created() {
        this.role = this.$route.query.role;
        this.$store.commit('SAVE_ROLE', this.role);
        console.log(this.role, 'this.$route.query.role')
    },
    mounted() {
        this.initMonitorRoom();
    },
    computed: {
        ...mapState({
            global: state=>state.global
        })
    },
    methods: {
        initMonitorRoom() {
            getMonitorRoom().then(res => {
                let _time = 0,  _timerPause = true, that = this;
                that.room_info = res;                    
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
                _time = that.timerNum;
                _timerPause = that.timePause;
                that.timeClock = setInterval(function(){
                    if(_timerPause) {
                        _time--;
                        if (_time == 0) { 
                            _time = 10;
                            // autoRefresh();
                            clearInterval( that.timeClock)
                        }
                        that.timerNum = _time;
                    } else {
                        clearInterval( that.timeClock)
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
        initSingleVideo(permit) {
            console.log(permit, 'entry[]---permit')
            let msg = {"permit": permit};
            getSingleEntry({ data: msg }).then(res => {
                if (res.code == 200) {
                    connect(res.data.socket_id);
                    this.entryInfo.push(res.data);
                    console.log(this.entryInfo, 'entry-res')
                }

            })
        },
        getPrevDta() {
            this.entryInfo.pop(0,1);
            console.log(this.entryInfo,'prev')

        },
        getNextDta() {
            this.entryInfo.splice(0,1);
            console.log(this.entryInfo,'next')
        },
        togglesEventBlock(item, toggles) {
            console.log(item, toggles)
            toggles == 'one' ? item.eagle_socket_id = true : item.eagle_socket_id = false;
        }
    }
}
</script>

<style scoped lang="scss">
@import './monitorwall.scss';
</style>